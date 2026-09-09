import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { InvestmentRepository } from '../providers'

interface Input {
  ownerId: string
  investmentId: string
  bankId?: string | null
  name?: string
  kind?: string
  investedAmount?: number
  currentAmount?: number | null
  startedOn?: Date
  maturityOn?: Date | null
  notes?: string | null
}

/**
 * Edits an investment of the caller's own — most often to write down what it is
 * worth this month, which is the whole point of keeping a current value apart
 * from the applied one. Someone else's answers as missing (anti-IDOR).
 */
export default class UpdateInvestment implements UseCase<Input, void> {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute({ ownerId, investmentId, ...fields }: Input): Promise<void> {
    const investment = await this.repository.findById(investmentId)
    if (!investment || !investment.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.INVESTMENT_NOT_FOUND, investmentId)
    }

    const renamed = fields.name !== undefined && fields.name.trim() !== investment.name
    investment.edit(fields)

    // Only checked when the name actually changed, so the row never clashes
    // with the copy of itself already stored.
    if (renamed && (await this.repository.existsByName(ownerId, investment.name))) {
      ConflictError.throwError(Errors.INVESTMENT_ALREADY_EXISTS, investment.name)
    }

    await this.repository.update(investment)
  }
}
