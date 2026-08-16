import { UseCase } from 'shared'
import { TransactionDTO } from '../model'
import { TransactionQueryRepository, TransactionFilter } from '../providers'

interface Input {
  ownerId: string
  filter?: TransactionFilter
}

/** Read side (CQRS): the caller's movements, newest first, optionally narrowed
 * to a window/type/category. */
export default class ListMyTransactionsQuery implements UseCase<Input, TransactionDTO[]> {
  constructor(private readonly queryRepository: TransactionQueryRepository) {}

  async execute({ ownerId, filter }: Input): Promise<TransactionDTO[]> {
    return this.queryRepository.listByOwnerQuery(ownerId, filter)
  }
}
