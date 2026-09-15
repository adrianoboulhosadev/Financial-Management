import { UseCase, NotFoundError, ValidationError, Errors } from 'shared'
import { CardInvoicePayment } from '../model'
import { CardRepository, CardInvoicePaymentRepository } from '../providers'

interface Input {
  ownerId: string
  cardId: string
  // YYYY-MM — the month the invoice CLOSES in.
  period: string
  paid: boolean
}

/**
 * Ticks one invoice off the month's list (or un-ticks it). Only the DEVIATION
 * is written, so an invoice nobody touched costs no row at all — and un-ticking
 * drops the row rather than leaving a record of nothing.
 *
 * The card is loaded first for the ownership check (someone else's answers as
 * missing, never as forbidden) and for the one rule that cannot live on the
 * payment itself: a card with no calendar has no invoice to tick.
 */
export default class SetInvoicePaid implements UseCase<Input, void> {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly paymentRepository: CardInvoicePaymentRepository,
  ) {}

  async execute({ ownerId, cardId, period, paid }: Input): Promise<void> {
    const card = await this.cardRepository.findById(cardId)
    if (!card || !card.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CARD_NOT_FOUND, cardId)
    }
    if (!card.hasInvoice) {
      ValidationError.throwError(Errors.CARD_HAS_NO_INVOICE, cardId)
    }

    const payment =
      (await this.paymentRepository.findByCardAndPeriod(cardId, period)) ??
      new CardInvoicePayment({ ownerId, cardId, period })

    if (paid) payment.markPaid()
    else payment.markUnpaid()

    if (payment.isEmpty) {
      await this.paymentRepository.delete(payment.id.value)
      return
    }

    await this.paymentRepository.save(payment)
  }
}

