import { UpdateIncomeSource, IncomeSourceRepository } from '@income/core'
import { UpdateIncomeSourceInput } from '../@types'

export default class UpdateIncomeSourceController {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute(
    incomeSourceId: string,
    input: UpdateIncomeSourceInput,
    ownerId: string,
  ): Promise<void> {
    await new UpdateIncomeSource(this.repository).execute({ ownerId, incomeSourceId, ...input })
  }
}
