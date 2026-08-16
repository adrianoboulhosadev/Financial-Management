import { RecordTransaction, TransactionRepository } from '@transaction/core'
import { RecordTransactionInput } from '../@types'

export default class RecordTransactionController {
  constructor(private readonly repository: TransactionRepository) {}

  // ownerId comes from the JWT; categoryIsLeaf is resolved by the app layer
  // (which is the only one allowed to look at the `category` context).
  async execute(
    input: RecordTransactionInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const useCase = new RecordTransaction(this.repository)
    await useCase.execute({
      ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      occurredOn: new Date(input.occurredOn),
      attachmentUrl: input.attachmentUrl,
      categoryIsLeaf,
    })
  }
}
