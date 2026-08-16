import { DeleteTransaction, TransactionRepository } from '@transaction/core'

export default class DeleteTransactionController {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(transactionId: string, ownerId: string): Promise<void> {
    await new DeleteTransaction(this.repository).execute({ ownerId, transactionId })
  }
}
