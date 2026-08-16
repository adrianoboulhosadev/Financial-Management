import { DeleteIncomeSource, IncomeSourceRepository } from '@income/core'

export default class DeleteIncomeSourceController {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute(incomeSourceId: string, ownerId: string): Promise<void> {
    await new DeleteIncomeSource(this.repository).execute({ ownerId, incomeSourceId })
  }
}
