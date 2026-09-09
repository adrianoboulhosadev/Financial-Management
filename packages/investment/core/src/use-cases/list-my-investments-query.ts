import { UseCase } from 'shared'
import { InvestmentDTO } from '../model'
import { InvestmentQueryRepository } from '../providers'

/** Read side (CQRS): every investment of the caller, active or not — the screen
 * that manages them needs to see the redeemed ones too. */
export default class ListMyInvestmentsQuery implements UseCase<string, InvestmentDTO[]> {
  constructor(private readonly queryRepository: InvestmentQueryRepository) {}

  async execute(ownerId: string): Promise<InvestmentDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}
