import { UpdateTransaction, TransactionRepository } from '@transaction/core'
import { UpdateTransactionInput } from '../@types'

export default class UpdateTransactionController {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    transactionId: string,
    input: UpdateTransactionInput,
    ownerId: string,
    categoryIsLeaf?: boolean,
  ): Promise<void> {
    const useCase = new UpdateTransaction(this.repository)
    await useCase.execute({
      ownerId,
      transactionId,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      // Only converted when the field was actually sent — `undefined` is what
      // tells the entity to leave the date alone.
      occurredOn: input.occurredOn ? new Date(input.occurredOn) : undefined,
      attachmentUrl: input.attachmentUrl,
      categoryIsLeaf,
    })
  }
}
