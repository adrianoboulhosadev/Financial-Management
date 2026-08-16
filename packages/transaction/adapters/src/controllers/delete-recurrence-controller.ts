import { DeleteRecurrence, RecurrenceRepository } from '@transaction/core'

export default class DeleteRecurrenceController {
  constructor(private readonly repository: RecurrenceRepository) {}

  async execute(recurrenceId: string, ownerId: string): Promise<void> {
    await new DeleteRecurrence(this.repository).execute({ ownerId, recurrenceId })
  }
}
