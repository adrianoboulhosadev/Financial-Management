import { UpdateTransaction, TransactionRepository } from '@transaction/core'
import { UpdateTransactionInput } from '../@types'

export default class UpdateTransactionController {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    transactionId: string,
    input: UpdateTransactionInput,
    ownerId: string,
  ): Promise<void> {
    const useCase = new UpdateTransaction(this.repository)
    await useCase.execute({
      ownerId,
      transactionId,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      // Undefined leaves the date alone — only a value sent moves it.
      occurredOn: input.occurredOn !== undefined ? new Date(input.occurredOn) : undefined,
      attachmentUrl: input.attachmentUrl,
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
    })
  }
}
