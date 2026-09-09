import { UseCase, Id } from 'shared'
import { Transaction } from '../model'
import { InstallmentPlanner } from '../domain-services'
import { TransactionRepository } from '../providers'

interface Input {
  ownerId: string
  type: string
  categoryId?: string | null
  description: string
  amount: number
  occurredOn: Date
  attachmentUrl?: string | null
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
  /** How many months a credit purchase is split over. 1 (or absent) is the
   * ordinary case: one movement, one month. */
  installments?: number
}

/**
 * Records a movement. Every rule about the movement itself lives in the
 * Transaction entity (positive amount, description, an expense always having a
 * category, a split only ever being on credit).
 *
 * The one thing decided HERE is what a split purchase means: N rows instead of
 * one, sharing a group id, one per month — because the point of the feature is
 * that next month's charge is already visible today. The arithmetic of the
 * split belongs to the InstallmentPlanner domain service; `amount` is the TOTAL
 * the owner typed, never the value of one instalment.
 */
export default class RecordTransaction implements UseCase<Input, void> {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: Input): Promise<void> {
    const installments = input.installments ?? 1

    if (installments <= 1) {
      await this.repository.create(this.transactionOf(input))
      return
    }

    // Built up front so the entity rejects a bad total/count before any row is
    // written, and so every row of the purchase carries the same group id.
    const groupId = Id.create()
    const plan = InstallmentPlanner.plan(input.amount, installments, input.occurredOn)
    const transactions = plan.map((entry) =>
      this.transactionOf({
        ...input,
        amount: entry.amountCents,
        occurredOn: entry.occurredOn,
        installments,
        installmentNumber: entry.installmentNumber,
        installmentGroupId: groupId,
      }),
    )

    // One call, so a crash halfway cannot leave a purchase half recorded.
    await this.repository.createMany(transactions)
  }

  private transactionOf(
    input: Input & { installmentNumber?: number; installmentGroupId?: string },
  ): Transaction {
    return new Transaction({
      ownerId: input.ownerId,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description,
      amount: input.amount,
      occurredOn: input.occurredOn,
      attachmentUrl: input.attachmentUrl,
      bankId: input.bankId,
      cardId: input.cardId,
      paymentMethod: input.paymentMethod,
      installments: input.installments,
      installmentNumber: input.installmentNumber,
      installmentGroupId: input.installmentGroupId,
    })
  }
}
