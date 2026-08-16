import { UseCase, NotFoundError, ValidationError, Errors } from 'shared'
import { TransactionRepository } from '../providers'

interface Input {
  ownerId: string
  transactionId: string
  categoryId?: string | null
  description?: string
  amount?: number
  occurredOn?: Date
  attachmentUrl?: string | null
  categoryIsLeaf?: boolean
}

/**
 * Edits a movement of the caller's own. Someone else's row answers as missing
 * (anti-IDOR). The entity re-applies every invariant, so an edit cannot reach a
 * state creation would have refused.
 */
export default class UpdateTransaction implements UseCase<Input, void> {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: Input): Promise<void> {
    if (input.categoryId && input.categoryIsLeaf === false) {
      ValidationError.throwError(Errors.CATEGORY_NOT_LEAF, input.categoryId)
    }

    const transaction = await this.repository.findById(input.transactionId)
    if (!transaction || !transaction.belongsTo(input.ownerId)) {
      NotFoundError.throwError(Errors.TRANSACTION_NOT_FOUND, input.transactionId)
    }

    transaction.edit({
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      occurredOn: input.occurredOn,
      attachmentUrl: input.attachmentUrl,
    })

    await this.repository.update(transaction)
  }
}
