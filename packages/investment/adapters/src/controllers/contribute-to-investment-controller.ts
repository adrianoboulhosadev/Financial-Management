import {
  ContributeToInvestment,
  InvestmentRepository,
  InvestmentContributionRepository,
} from '@investment/core'
import { ContributeToInvestmentInput } from '../@types'

export default class ContributeToInvestmentController {
  constructor(
    private readonly repository: InvestmentRepository,
    private readonly contributionRepository: InvestmentContributionRepository,
  ) {}

  async execute(
    investmentId: string,
    input: ContributeToInvestmentInput,
    ownerId: string,
  ): Promise<void> {
    await new ContributeToInvestment(this.repository, this.contributionRepository).execute({
      ownerId,
      investmentId,
      amount: input.amount,
      occurredOn: new Date(input.occurredOn),
    })
  }
}
