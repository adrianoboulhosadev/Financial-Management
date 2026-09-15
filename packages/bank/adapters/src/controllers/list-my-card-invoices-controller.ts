import { ListMyCardInvoicesQuery, CardQueryRepository, CardCharge, CardInvoicesDTO } from '@bank/core'

/** The charges come from the APP, not from here: only the app layer may cross
 * into `transaction`, and the invoice only ever needed the day and the amount. */
export default class ListMyCardInvoicesController {
  constructor(private readonly queryRepository: CardQueryRepository) {}

  async execute(ownerId: string, charges: CardCharge[]): Promise<CardInvoicesDTO[]> {
    return new ListMyCardInvoicesQuery(this.queryRepository).execute({ ownerId, charges })
  }
}
