import { UseCase, NotFoundError, Errors } from 'shared'
import { InvestmentContribution } from '../model'
import { InvestmentRepository, InvestmentContributionRepository } from '../providers'

interface Input {
  ownerId: string
  investmentId: string
  // INTEGER CENTS.
  amount: number
  occurredOn: Date
}

/**
 * Puts money into an investment the owner already has — typically what was left
 * over at the end of a month.
 *
 * Two things happen and they are ONE fact: the contribution is filed (so there
 * is a record of when the money moved, which is what lets the month know how
 * much of its leftover is already working) and the investment grows by it. The
 * port composes both in a single commit; the arithmetic belongs to the entity,
 * which is also where the rule that a contribution raises the CURRENT value too
 * lives.
 */
export default class ContributeToInvestment implements UseCase<Input, void> {
  constructor(
    private readonly investmentRepository: InvestmentRepository,
    private readonly contributionRepository: InvestmentContributionRepository,
  ) {}

  async execute({ ownerId, investmentId, amount, occurredOn }: Input): Promise<void> {
    const investment = await this.investmentRepository.findById(investmentId)
    if (!investment || !investment.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INVESTMENT_NOT_FOUND, investmentId)
    }

    const contribution = new InvestmentContribution({
      ownerId,
      investmentId,
      amount,
      occurredOn,
    })
    // Refuses a redeemed investment (INVESTMENT_NOT_ACTIVE) before anything is
    // written, so a refused contribution leaves no row behind.
    investment.contribute(contribution.amount.cents)

    await this.contributionRepository.record(contribution, investment)
  }
}
