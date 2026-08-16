import { Injectable, Logger } from '@nestjs/common'
import { DomainEvent, EventPublisher } from 'shared'
import { NotificationFacade, NotificationInput } from '@notification/adapters'
import { UserRegistered, UserApproved } from '@auth/adapters'
import { PrismaNotificationRepository } from './prisma-notification-repository'
import { NotificationAudience } from './notification-audience'
import { LiveUpdates } from './live-updates'

/**
 * The single place that turns a DOMAIN EVENT into the notification(s) it
 * deserves, so controllers go back to just calling their facade and every "what
 * do we tell whom" decision lives here.
 *
 * Implements the `EventPublisher` port from `shared`, so the use cases depend on
 * an interface, never on this class.
 *
 * Two deliberate choices about WHEN and HOW it runs:
 *
 * 1. It runs AFTER the business operation committed, never inside its
 *    transaction — an account that was approved must not be un-approved because
 *    an inbox line failed to write. (The worker's recurrence is the exception,
 *    and for the opposite reason: there the notification IS derived from the
 *    same rows being written, so it rides along in the same transaction.)
 * 2. It swallows its own failures (logging them): the caller's HTTP response
 *    describes the operation, and a notification that never arrived is not a
 *    reason to tell the admin their approval failed.
 *
 * Unknown events are ignored on purpose: a context is free to raise an event
 * nobody notifies about yet (that is the point of events being facts, not
 * commands), and adding one must never break an existing flow.
 */
@Injectable()
export class DomainEventListener implements EventPublisher {
  private readonly logger = new Logger(DomainEventListener.name)

  constructor(
    private readonly notificationRepository: PrismaNotificationRepository,
    private readonly audience: NotificationAudience,
    private readonly liveUpdates: LiveUpdates,
  ) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await this.deliver(await this.translate(event))
      } catch (error) {
        this.logger.error(`failed to handle ${event.constructor.name}`, error as Error)
      }
    }
  }

  private async deliver(items: NotificationInput[]): Promise<void> {
    if (items.length === 0) return
    await new NotificationFacade(this.notificationRepository).send(items)
    // Only after the write succeeded: a ping for a notification that failed to
    // save would make the client re-read and find nothing.
    await this.liveUpdates.notifyUsers(items.map((item) => item.userId))
  }

  private async translate(event: DomainEvent): Promise<NotificationInput[]> {
    // --- events that reach the ADMINS (someone is waiting at the gate)
    if (event instanceof UserRegistered) {
      // The e-mail is in the text on purpose and only reaches admins: without it
      // the owner cannot tell who is asking to get in — the same reason the
      // control room shows it.
      const adminIds = await this.audience.adminIds()
      return adminIds.map((adminId) => ({
        userId: adminId,
        type: 'admin_signup_pending',
        signupEmail: event.email,
      }))
    }

    // --- events that reach the account holder
    if (event instanceof UserApproved) {
      // Waiting in the inbox: the person only reads it once they can finally log
      // in, which is exactly when it is useful. Rejection raises no event at all
      // (see User.reject) — being barred must look like a wrong password.
      return [{ userId: event.userId, type: 'account_approved', referenceId: event.userId }]
    }

    return []
  }
}
