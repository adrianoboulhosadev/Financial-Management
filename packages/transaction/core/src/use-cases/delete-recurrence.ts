import { UseCase, NotFoundError, Errors } from 'shared'
import { RecurrenceRepository } from '../providers'

interface Input {
  ownerId: string
  recurrenceId: string
}

/**
 * Deletes a fixed movement. The transactions it already posted STAY — they
 * record money that really moved, and deleting the rule that produced them must
 * not rewrite the past (the rows just stop pointing at a recurrence).
 */
export default class DeleteRecurrence implements UseCase<Input, void> {
  constructor(private readonly repository: RecurrenceRepository) {}

  async execute({ ownerId, recurrenceId }: Input): Promise<void> {
    const recurrence = await this.repository.findById(recurrenceId)
    if (!recurrence || !recurrence.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.RECURRENCE_NOT_FOUND, recurrenceId)
    }

    await this.repository.delete(recurrenceId)
  }
}
