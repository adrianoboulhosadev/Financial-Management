import { SetInvestmentActive, InvestmentRepository } from '@investment/core'
import { SetInvestmentActiveInput } from '../@types'

export default class SetInvestmentActiveController {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute(
    investmentId: string,
    input: SetInvestmentActiveInput,
    ownerId: string,
  ): Promise<void> {
    await new SetInvestmentActive(this.repository).execute({
      ownerId,
      investmentId,
      active: input.active,
    })
  }
}
