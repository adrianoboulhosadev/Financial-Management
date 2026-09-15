import {
  ListMyPayableInvoicesQuery,
  CardQueryRepository,
  CardInvoicePaymentQueryRepository,
  CardCharge,
  PayableInvoiceDTO,
} from '@bank/core'

/** The invoices the month has to pay. The charges come from the APP: only it
 * may cross into `transaction`. */
export default class ListMyPayableInvoicesController {
  constructor(
    private readonly cardRepository: CardQueryRepository,
    private readonly paymentRepository: CardInvoicePaymentQueryRepository,
  ) {}

  async execute(ownerId: string, period: string, charges: CardCharge[]): Promise<PayableInvoiceDTO[]> {
    return new ListMyPayableInvoicesQuery(this.cardRepository, this.paymentRepository).execute({
      ownerId,
      period,
      charges,
    })
  }
}
