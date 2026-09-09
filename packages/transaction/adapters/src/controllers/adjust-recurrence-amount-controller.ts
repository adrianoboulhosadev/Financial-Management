import {
  AdjustRecurrenceAmount,
  RecurrenceRepository,
  RecurrencePaymentRepository,
} from '@transaction/core'
import { AdjustRecurrenceAmountInput } from '../@types'

export default class AdjustRecurrenceAmountController {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly paymentRepository: RecurrencePaymentRepository,
  ) {}

  async execute(
    recurrenceId: string,
    input: AdjustRecurrenceAmountInput,
    ownerId: string,
  ): Promise<void> {
    await new AdjustRecurrenceAmount(this.recurrenceRepository, this.paymentRepository).execute({
      ownerId,
      recurrenceId,
      period: input.period,
      amount: input.amount,
    })
  }
}
