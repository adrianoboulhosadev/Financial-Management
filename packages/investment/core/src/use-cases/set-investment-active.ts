import { UseCase, NotFoundError, Errors } from 'shared'
import { InvestmentRepository } from '../providers'

interface Input {
  ownerId: string
  investmentId: string
  active: boolean
}

/** Marks an investment as redeemed (or brings it back). Deactivating drops it
 * out of the portfolio total WITHOUT erasing it — what was done with the money
 * stays on the books. */
export default class SetInvestmentActive implements UseCase<Input, void> {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute({ ownerId, investmentId, active }: Input): Promise<void> {
    const investment = await this.repository.findById(investmentId)
    if (!investment || !investment.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INVESTMENT_NOT_FOUND, investmentId)
    }

    if (active) investment.activate()
    else investment.deactivate()

    await this.repository.update(investment)
  }
}
