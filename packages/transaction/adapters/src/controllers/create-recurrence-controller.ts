import { CreateRecurrence, RecurrenceRepository, RecurrenceQueue } from '@transaction/core'
import { CreateRecurrenceInput } from '../@types'

export default class CreateRecurrenceController {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(
    input: CreateRecurrenceInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const useCase = new CreateRecurrence(this.repository, this.queue)
    await useCase.execute({ ownerId, ...input, categoryIsLeaf })
  }
}
