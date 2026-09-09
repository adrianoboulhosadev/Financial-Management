import { UseCase, NotFoundError, Errors } from 'shared'
import { TransactionRepository } from '../providers'

interface Input {
  ownerId: string
  transactionId: string
  categoryId?: string | null
  description?: string
  amount?: number
  occurredOn?: Date
  attachmentUrl?: string | null
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
}

/**
 * Edits a movement of the caller's own. Someone else's row answers as missing
 * (anti-IDOR). The entity re-applies every invariant, so an edit cannot reach a
 * state creation would have refused.
 *
 * The SPLIT is not editable: turning a 6x into a 3x is a different set of rows,
 * not a different value on one of them, so the instalment fields are simply not
 * part of the input.
 */
export default class UpdateTransaction implements UseCase<Input, void> {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: Input): Promise<void> {
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
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
    })

    await this.repository.update(transaction)
  }
}
