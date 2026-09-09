import { UseCase, NotFoundError, Errors } from 'shared'
import { InvestmentRepository } from '../providers'

interface Input {
  ownerId: string
  investmentId: string
}

/** Removes an investment for good. Deactivating is usually the better move —
 * this is for a row that should never have existed. */
export default class DeleteInvestment implements UseCase<Input, void> {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute({ ownerId, investmentId }: Input): Promise<void> {
    const investment = await this.repository.findById(investmentId)
    if (!investment || !investment.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INVESTMENT_NOT_FOUND, investmentId)
    }

    await this.repository.delete(investmentId)
  }
}
