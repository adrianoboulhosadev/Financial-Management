import {
  SetRecurrencePaid,
  RecurrenceRepository,
  RecurrencePaymentRepository,
} from '@transaction/core'
import { SetRecurrencePaidInput } from '../@types'

export default class SetRecurrencePaidController {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly paymentRepository: RecurrencePaymentRepository,
  ) {}

  async execute(
    recurrenceId: string,
    input: SetRecurrencePaidInput,
    ownerId: string,
  ): Promise<void> {
    await new SetRecurrencePaid(this.recurrenceRepository, this.paymentRepository).execute({
      ownerId,
      recurrenceId,
      period: input.period,
      paid: input.paid,
    })
  }
}
