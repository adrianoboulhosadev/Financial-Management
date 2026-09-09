import { ListMyBanksQuery, BankQueryRepository, BankDTO } from '@bank/core'

export default class ListMyBanksController {
  constructor(private readonly queryRepository: BankQueryRepository) {}

  async execute(ownerId: string): Promise<BankDTO[]> {
    return new ListMyBanksQuery(this.queryRepository).execute(ownerId)
  }
}
