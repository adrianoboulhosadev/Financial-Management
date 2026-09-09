import { CreateInvestment, InvestmentRepository } from '@investment/core'
import { CreateInvestmentInput } from '../@types'

export default class CreateInvestmentController {
  constructor(private readonly repository: InvestmentRepository) {}

  // ownerId comes from the JWT (HTTP boundary), never from the request body.
  async execute(input: CreateInvestmentInput, ownerId: string): Promise<void> {
    await new CreateInvestment(this.repository).execute({
      ownerId,
      bankId: input.bankId,
      name: input.name,
      kind: input.kind,
      investedAmount: input.investedAmount,
      currentAmount: input.currentAmount,
      startedOn: new Date(input.startedOn),
      maturityOn: input.maturityOn ? new Date(input.maturityOn) : null,
      notes: input.notes,
    })
  }
}
