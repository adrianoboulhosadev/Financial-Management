import { SetIncomeSourceActive, IncomeSourceRepository } from '@income/core'
import { SetIncomeSourceActiveInput } from '../@types'

export default class SetIncomeSourceActiveController {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute(
    incomeSourceId: string,
    input: SetIncomeSourceActiveInput,
    ownerId: string,
  ): Promise<void> {
    await new SetIncomeSourceActive(this.repository).execute({
      ownerId,
      incomeSourceId,
      active: input.active,
    })
  }
}
