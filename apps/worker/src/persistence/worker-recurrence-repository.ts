import {
  RecurrenceRepository,
  Recurrence,
  Transaction,
  TransactionType,
} from '@transaction/adapters'
import { Notification } from '@notification/adapters'
import { Prisma } from 'database'
import { prisma } from './prisma'
import { notificationFor } from '../recurrence/recurrence-notifications'

/**
 * The worker's own driven adapter of the RecurrenceRepository port — a copy of
 * the backend's, and deliberately so: a driven adapter belongs to the app that
 * needs it, and this one does something the backend's does not.
 *
 * `postOccurrence` writes the movement, advances the schedule AND files the
 * notification in ONE transaction, and that is deliberate: here the
 * notification is DERIVED from the very rows being written, so it must neither
 * be lost if the commit succeeds nor survive if it rolls back. The budget alert
 * is the opposite case — a standalone write, with nothing to be atomic with.
 */
export class WorkerRecurrenceRepository implements RecurrenceRepository {
  async findById(id: string): Promise<Recurrence | null> {
    const row = await prisma.recurrence.findUnique({ where: { id } })
    return row
      ? new Recurrence({
          id: row.id,
          ownerId: row.ownerId,
          type: row.type as TransactionType,
          categoryId: row.categoryId,
          description: row.description,
          amount: row.amount,
          dayOfMonth: row.dayOfMonth,
          active: row.active,
          nextRunAt: row.nextRunAt,
          lastRunAt: row.lastRunAt,
        })
      : null
  }

  async postOccurrence(transaction: Transaction, recurrence: Recurrence): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      // skipDuplicates + the (recurrence_id, occurred_on) unique index is what
      // makes a redelivered job a no-op instead of a second charge.
      const written = await tx.transaction.createMany({
        data: [
          {
            id: transaction.id.value,
            ownerId: transaction.ownerId,
            type: transaction.type,
            categoryId: transaction.categoryId,
            description: transaction.description,
            amount: transaction.amount.cents,
            occurredOn: transaction.occurredOn,
            recurrenceId: transaction.recurrenceId,
          },
        ],
        skipDuplicates: true,
      })

      await tx.recurrence.update({
        where: { id: recurrence.id.value },
        data: { nextRunAt: recurrence.nextRunAt, lastRunAt: recurrence.lastRunAt },
      })

      // Only when the movement really landed: announcing a month that was
      // already posted would be telling the owner about nothing.
      if (written.count > 0) await this.fileNotification(tx, notificationFor(transaction))

      return written.count > 0
    })
  }

  private async fileNotification(
    tx: Prisma.TransactionClient,
    notification: Notification,
  ): Promise<void> {
    await tx.notification.createMany({
      data: [
        {
          id: notification.id.value,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link: notification.link,
          referenceId: notification.referenceId,
        },
      ],
      skipDuplicates: true,
    })
  }

  // --- the rest of the port: this app never issues these commands ------------
  // The worker only ever RUNS a recurrence; creating, editing and deleting one
  // are the owner's actions and live in the backend.

  async create(): Promise<void> {
    throw new Error('the worker does not create recurrences')
  }

  async update(): Promise<void> {
    throw new Error('the worker does not edit recurrences')
  }

  async delete(): Promise<void> {
    throw new Error('the worker does not delete recurrences')
  }

  async existsByCategory(): Promise<boolean> {
    throw new Error('the worker does not answer category usage')
  }
}
