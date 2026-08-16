import {
  ListMyTransactionsQuery,
  TransactionQueryRepository,
  TransactionFilter,
  TransactionDTO,
} from '@transaction/core'

export default class ListMyTransactionsController {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute(ownerId: string, filter?: TransactionFilter): Promise<TransactionDTO[]> {
    return new ListMyTransactionsQuery(this.queryRepository).execute({ ownerId, filter })
  }
}
