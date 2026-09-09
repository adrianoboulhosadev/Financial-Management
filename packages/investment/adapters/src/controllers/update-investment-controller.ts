import { UpdateInvestment, InvestmentRepository } from '@investment/core'
import { UpdateInvestmentInput } from '../@types'

export default class UpdateInvestmentController {
  constructor(private readonly repository: InvestmentRepository) {}

  async execute(
    investmentId: string,
    input: UpdateInvestmentInput,
    ownerId: string,
  ): Promise<void> {
    await new UpdateInvestment(this.repository).execute({
      ownerId,
      investmentId,
      bankId: input.bankId,
      name: input.name,
      kind: input.kind,
      investedAmount: input.investedAmount,
      currentAmount: input.currentAmount,
      // Undefined leaves the date alone; an explicit null clears the maturity.
      startedOn: input.startedOn !== undefined ? new Date(input.startedOn) : undefined,
      maturityOn:
        input.maturityOn === undefined ? undefined : input.maturityOn ? new Date(input.maturityOn) : null,
      notes: input.notes,
    })
  }
}
