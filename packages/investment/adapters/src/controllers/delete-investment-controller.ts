import { DeleteInvestment, InvestmentRepository } from '@investment/core'

export default class DeleteInvestmentController {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute(investmentId: string, ownerId: string): Promise<void> {
    await new DeleteInvestment(this.repository).execute({ ownerId, investmentId })
  }
}
