import { FindMyBankQuery, BankQueryRepository, BankDTO } from '@bank/core'

export default class FindMyBankController {
  constructor(private readonly queryRepository: BankQueryRepository) {}

  async execute(bankId: string, ownerId: string): Promise<BankDTO> {
    return new FindMyBankQuery(this.queryRepository).execute({ ownerId, bankId })
  }
}
