import { UseCase, NotFoundError, Errors } from 'shared'
import { RecurrenceRepository, RecurrenceQueue } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
  active: boolean
}

/**
 * Pauses or resumes a fixed movement. Pausing does NOT delete anything already
 * posted; resuming re-schedules from today, so a recurrence paused for months
 * does not wake up owing every month it slept through (the entity owns both
 * rules).
 */
export default class SetRecurrenceActive implements UseCase<Input, void> {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute({ ownerId, recurrenceId, active }: Input): Promise<void> {
    const recurrence = await this.repository.findById(recurrenceId)
    if (!recurrence || !recurrence.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.RECURRENCE_NOT_FOUND, recurrenceId)
    }

    if (active) recurrence.resume()
    else recurrence.pause()

    await this.repository.update(recurrence)
    if (recurrence.active) {
      await this.queue?.scheduleRun({ recurrenceId: recurrence.id.value, at: recurrence.nextRunAt })
    }
  }
}
