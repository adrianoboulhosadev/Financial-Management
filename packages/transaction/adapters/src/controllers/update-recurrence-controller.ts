import { UpdateRecurrence, RecurrenceRepository, RecurrenceQueue } from '@transaction/core'
import { UpdateRecurrenceInput } from '../@types'

export default class UpdateRecurrenceController {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(
    recurrenceId: string,
    input: UpdateRecurrenceInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const useCase = new UpdateRecurrence(this.repository, this.queue)
    await useCase.execute({ ownerId, recurrenceId, ...input, categoryIsLeaf })
  }
}
