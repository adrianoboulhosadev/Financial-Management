import { Injectable } from '@nestjs/common'
import { TransactionFacade } from '@transaction/adapters'
import { CardCharge } from '@bank/adapters'
import { MonthPeriod } from 'shared'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'

/**
 * What went on the owner's credit cards, as the plain `{ cardId, occurredOn,
 * amountCents }` the invoice is folded from. It lives in the APP layer because
 * it is the only layer allowed to talk to two contexts — `bank` never imports
 * `transaction`, exactly like the deletion check next door.
 *
 * Only movements paid `credit` count. A debit purchase on the same card left
 * the account the moment it was made, so putting it on an invoice would bill
 * money that is already gone.
 *
 * FIXED BILLS are deliberately left out. A subscription charged to the card
 * becomes a movement when the worker posts it, and only then does it exist on
 * the invoice — the same line the rest of the product draws between money that
 * moved and a month's commitment.
 */
@Injectable()
export class CardChargeResolver {
  constructor(private readonly transactionRepository: PrismaTransactionRepository) {}

  async listByOwner(ownerId: string): Promise<CardCharge[]> {
    const movements = await new TransactionFacade(
      undefined,
      this.transactionRepository,
    ).listMyTransactions(ownerId, {
      // From the start of last month: whatever day a card closes on, the
      // invoice still taking charges cannot have opened earlier than that. The
      // window has NO upper bound on purpose — an instalment due next March is
      // already holding the limit down, and cutting it off at today would
      // report a card as free when it is not.
      from: MonthPeriod.of().previous().start,
      type: 'expense',
    })

    return movements
      .filter((movement) => movement.cardId !== null && movement.paymentMethod === 'credit')
      .map((movement) => ({
        cardId: movement.cardId as string,
        occurredOn: movement.occurredOn,
        amountCents: movement.amount,
      }))
  }
}
