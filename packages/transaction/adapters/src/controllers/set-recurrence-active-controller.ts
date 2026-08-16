import { SetRecurrenceActive, RecurrenceRepository, RecurrenceQueue } from '@transaction/core'
import { SetRecurrenceActiveInput } from '../@types'

export default class SetRecurrenceActiveController {
  constructor(
    private readonly repository: RecurrenceRepository,
    private readonly queue?: RecurrenceQueue,
  ) {}

  async execute(
    recurrenceId: string,
    input: SetRecurrenceActiveInput,
    ownerId: string,
  ): Promise<void> {
    const useCase = new SetRecurrenceActive(this.repository, this.queue)
    await useCase.execute({ ownerId, recurrenceId, active: input.active })
  }
}
