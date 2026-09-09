import { Injectable } from '@nestjs/common'
import { BankFacade } from '@bank/adapters'
import { PrismaBankRepository } from './prisma-bank-repository'
import { PrismaCardRepository } from './prisma-card-repository'

/**
 * The cross-context check every movement makes before it can say where the
 * money went through: does this bank/card exist, and is it MINE?
 *
 * Lives in the APP layer because it is the only one allowed to talk to two
 * contexts — `transaction` never imports `bank`. It answers nothing back: a
 * bank belonging to somebody else throws BANK_NOT_FOUND from the query itself
 * (anti-IDOR), so reaching the next line already means the reference is good.
 */
@Injectable()
export class PaymentSourceResolver {
  constructor(
    private readonly bankRepository: PrismaBankRepository,
    private readonly cardRepository: PrismaCardRepository,
  ) {}

  /** No bank/card given (cash, or a movement recorded before banks existed)
   * means there is nothing to check. */
  async ensureOwned(
    ownerId: string,
    bankId?: string | null,
    cardId?: string | null,
  ): Promise<void> {
    const facade = new BankFacade(
      undefined,
      this.bankRepository,
      undefined,
      this.cardRepository,
    )
    if (bankId) await facade.findMyBank(bankId, ownerId)
    if (cardId) await facade.findMyCard(cardId, ownerId)
  }
}
