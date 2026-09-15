import { UseCase } from 'shared'
import { CardInvoicesDTO } from '../model'
import { CardQueryRepository } from '../providers'
import { InvoiceCalculator } from '../domain-services'

/** A charge as the app layer hands it over: PURE DATA, so `bank` never has to
 * know the `transaction` context exists — the same shape the category tree's
 * `inUse` and the budget usage's spending travel in. */
export interface CardCharge {
  cardId: string
  occurredOn: Date
  amountCents: number
}

interface Input {
  ownerId: string
  charges: CardCharge[]
  // Which day counts as "today". Defaults to now; passed in mostly so the
  // boundary between the open invoice and the next one is testable.
  reference?: Date
}

/**
 * The invoices of every card the caller owns. Cards with no calendar are left
 * out rather than returned empty: they have no invoice, and a row reading
 * "R$ 0,00" would claim they do.
 *
 * The charges arrive from outside because only the app layer may cross
 * contexts. Reading them here would mean importing `transaction`, which the
 * fronteiras rule forbids and which would also make the invoice depend on how
 * a movement happens to be stored.
 */
export default class ListMyCardInvoicesQuery implements UseCase<Input, CardInvoicesDTO[]> {
  constructor(private readonly repository: CardQueryRepository) {}

  async execute({ ownerId, charges, reference }: Input): Promise<CardInvoicesDTO[]> {
    const cards = await this.repository.listByOwnerQuery(ownerId)

    const chargesByCard = new Map<string, CardCharge[]>()
    for (const charge of charges) {
      const current = chargesByCard.get(charge.cardId)
      if (current) current.push(charge)
      else chargesByCard.set(charge.cardId, [charge])
    }

    return cards
      .map((card) =>
        InvoiceCalculator.calculate(card, chargesByCard.get(card.id) ?? [], reference),
      )
      .filter((invoices): invoices is CardInvoicesDTO => invoices !== null)
  }
}
