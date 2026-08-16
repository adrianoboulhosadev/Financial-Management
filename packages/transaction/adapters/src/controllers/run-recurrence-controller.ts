import { RunRecurrence, RecurrenceRepository, RecurrenceQueue } from '@transaction/core'

/** System entry point — the worker calls it off a delayed job. There is no
 * actor: the calendar asked, not a person. */
export default class RunRecurrenceController {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(recurrenceId: string): Promise<void> {
    await new RunRecurrence(this.repository, this.queue).execute({ recurrenceId })
  }
}
