import { UseCase, ValidationError, Errors } from 'shared'
import { Transaction } from '../model'
import { TransactionRepository } from '../providers'

interface Input {
  ownerId: string
  type: string
  categoryId?: string | null
  description: string
  amount: number
  occurredOn: Date
  attachmentUrl?: string | null
  /**
   * Whether the given category exists, belongs to this user AND is a leaf.
   * Resolved by the APP layer (the backend asks `category`) and handed in as
   * plain data — `transaction` never imports another context. Absent when no
   * category was given at all.
   */
  categoryIsLeaf?: boolean
}

/**
 * Records a movement. Every rule about the movement itself lives in the
 * Transaction entity (positive amount, description, an expense always having a
 * category); the only thing decided here is the cross-context one: money is
 * filed on a LEAF, never on a branch that merely groups other categories.
 */
export default class RecordTransaction implements UseCase<Input, void> {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: Input): Promise<void> {
    if (input.categoryId && input.categoryIsLeaf === false) {
      ValidationError.throwError(Errors.CATEGORY_NOT_LEAF, input.categoryId)
    }

    const transaction = new Transaction({
      ownerId: input.ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      occurredOn: input.occurredOn,
      attachmentUrl: input.attachmentUrl,
    })

    await this.repository.create(transaction)
  }
}
