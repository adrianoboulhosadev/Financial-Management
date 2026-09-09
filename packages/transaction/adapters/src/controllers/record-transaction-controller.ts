import { RecordTransaction, TransactionRepository } from '@transaction/core'
import { RecordTransactionInput } from '../@types'

export default class RecordTransactionController {
  constructor(private readonly repository: TransactionRepository) {}

  // ownerId comes from the JWT; the bank/card/category the input points at were
  // already confirmed to belong to this user by the app layer.
  async execute(input: RecordTransactionInput, ownerId: string): Promise<void> {
    const useCase = new RecordTransaction(this.repository)
    await useCase.execute({
      ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      occurredOn: new Date(input.occurredOn),
      attachmentUrl: input.attachmentUrl,
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
      installments: input.installments,
    })
  }
}
