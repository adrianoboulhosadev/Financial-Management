import { UseCase, ConflictError, Errors } from 'shared'
import { Investment } from '../model'
import { InvestmentRepository } from '../providers'

interface Input {
  ownerId: string
  bankId?: string | null
  name: string
  kind: string
  investedAmount: number
  currentAmount?: number | null
  startedOn: Date
  maturityOn?: Date | null
  notes?: string | null
}

/** Records money the owner put somewhere to grow. Every rule about the
 * investment itself lives in the entity; the only thing decided here is that
 * one owner does not end up with two investments sharing a name. */
export default class CreateInvestment implements UseCase<Input, void> {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute(input: Input): Promise<void> {
    const investment = new Investment(input)

    if (await this.repository.existsByName(input.ownerId, investment.name)) {
      ConflictError.throwError(Errors.INVESTMENT_ALREADY_EXISTS, investment.name)
    }

    await this.repository.create(investment)
  }
}
