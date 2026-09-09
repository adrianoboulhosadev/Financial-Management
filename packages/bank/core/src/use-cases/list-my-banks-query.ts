import { UseCase } from 'shared'
import { BankDTO } from '../model'
import { BankQueryRepository } from '../providers'

/** Read side (CQRS): the caller's banks. Scoped by the authenticated id the
 * HTTP boundary resolves — the port has no way to ask for "all". */
export default class ListMyBanksQuery implements UseCase<string, BankDTO[]> {
  constructor(private readonly queryRepository: BankQueryRepository) {}

  async execute(ownerId: string): Promise<BankDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId)
  }
}
