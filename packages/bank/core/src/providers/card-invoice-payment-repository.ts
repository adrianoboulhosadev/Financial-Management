import { CardInvoicePayment } from '../model'

/**
 * Invoice payment WRITE port. No `create`/`update` pair: the caller never knows
 * whether this invoice was already ticked, so `save` is an UPSERT on
 * (card, period) — which is what makes ticking the same invoice twice a no-op
 * instead of a second row.
 */
export interface CardInvoicePaymentRepository {
  findByCardAndPeriod(cardId: string, period: string): Promise<CardInvoicePayment | null>
  save(payment: CardInvoicePayment): Promise<void>
  delete(id: string): Promise<void>
}

/** Invoice payment READ port. The payable list needs every tick of the owner's
 * that could land in the month being asked about, so it reads by owner rather
 * than one invoice at a time. */
export interface CardInvoicePaymentQueryRepository {
  listByOwnerAndPeriodsQuery(ownerId: string, periods: string[]): Promise<CardInvoicePaymentDTO[]>
}

/** READ projection of a tick. */
export interface CardInvoicePaymentDTO {
  cardId: string
  // YYYY-MM, the CLOSING month.
  period: string
  paidAt: Date | null
}
