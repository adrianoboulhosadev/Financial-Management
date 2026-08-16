import { CreateIncomeSource, IncomeSourceRepository } from '@income/core'
import { CreateIncomeSourceInput } from '../@types'

export default class CreateIncomeSourceController {
  constructor(private readonly repository: IncomeSourceRepository) {}

  async execute(input: CreateIncomeSourceInput, ownerId: string): Promise<void> {
    await new CreateIncomeSource(this.repository).execute({ ownerId, ...input })
  }
}
