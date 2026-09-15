import { SetInvoicePaid, CardRepository, CardInvoicePaymentRepository } from '@bank/core'

export default class SetInvoicePaidController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly paymentRepository: CardInvoicePaymentRepository,
  ) {}

  async execute(cardId: string, period: string, paid: boolean, ownerId: string): Promise<void> {
    await new SetInvoicePaid(this.cardRepository, this.paymentRepository).execute({
      ownerId,
      cardId,
      period,
      paid,
    })
  }
}
