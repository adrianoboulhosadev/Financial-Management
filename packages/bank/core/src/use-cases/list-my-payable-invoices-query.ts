import { UseCase, MonthPeriod } from 'shared'
import { PayableInvoiceDTO } from '../model'
import { CardQueryRepository, CardInvoicePaymentQueryRepository } from '../providers'
import { InvoiceCalculator } from '../domain-services'
import { CardCharge } from './list-my-card-invoices-query'

interface Input {
  ownerId: string
  // YYYY-MM — the month whose bills are being listed.
  period: string
  charges: CardCharge[]
  reference?: Date
}

/**
 * The invoices the owner has to PAY in a given month — one line per credit
 * card, ordered by due date, which is the order they get paid in.
 *
 * Cards with no calendar and invoices that came to nothing are left out: a card
 * nobody used has no bill, and a R$ 0,00 line would ask for a tick on nothing.
 *
 * The charges arrive from outside because only the app layer may cross
 * contexts — the same pure data the card's own invoice view travels in.
 */
export default class ListMyPayableInvoicesQuery implements UseCase<Input, PayableInvoiceDTO[]> {
  constructor(
    private readonly cardRepository: CardQueryRepository,
    private readonly paymentRepository: CardInvoicePaymentQueryRepository,
  ) {}

  async execute({ ownerId, period, charges, reference }: Input): Promise<PayableInvoiceDTO[]> {
    const month = new MonthPeriod(period)
    const cards = await this.cardRepository.listByOwnerQuery(ownerId)

    // Which closing months could be due in this one: the month itself when the
    // due day comes after the closing day, the previous one otherwise. Asking
    // for both costs one query and spares the caller the rule.
    const payments = await this.paymentRepository.listByOwnerAndPeriodsQuery(ownerId, [
      month.previous().value,
      month.value,
    ])

    const chargesByCard = new Map<string, CardCharge[]>()
    for (const charge of charges) {
      const current = chargesByCard.get(charge.cardId)
      if (current) current.push(charge)
      else chargesByCard.set(charge.cardId, [charge])
    }

    return cards
      .map((card) =>
        InvoiceCalculator.payableIn(
          card,
          month,
          chargesByCard.get(card.id) ?? [],
          payments,
          reference,
        ),
      )
      .filter((invoice): invoice is PayableInvoiceDTO => invoice !== null)
      .sort((left, right) => left.dueOn.getTime() - right.dueOn.getTime())
  }
}
