import { UseCase, NotFoundError, Errors } from 'shared'
import { TransactionRepository } from '../providers'

interface Input {
  ownerId: string
  transactionId: string
}

/** Deletes a movement of the caller's own. Someone else's row answers as
 * missing (anti-IDOR), never as forbidden. */
export default class DeleteTransaction implements UseCase<Input, void> {
  constructor(private readonly repository: TransactionRepository) {}

  async execute({ ownerId, transactionId }: Input): Promise<void> {
    const transaction = await this.repository.findById(transactionId)
    if (!transaction || !transaction.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.TRANSACTION_NOT_FOUND, transactionId)
    }

    await this.repository.delete(transactionId)
  }
}
