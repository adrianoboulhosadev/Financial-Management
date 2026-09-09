import { Injectable } from '@nestjs/common'
import { PrismaTransactionRepository } from '../transaction/prisma-transaction-repository'
import { PrismaRecurrenceRepository } from '../transaction/prisma-recurrence-repository'
import { PrismaInvestmentRepository } from '../investment/prisma-investment-repository'

/**
 * The cross-context question a deletion asks: "is anything still pointing at
 * this bank/card?". It lives in the APP layer because it is the only layer
 * allowed to talk to several contexts — the answer then travels into the use
 * case as plain data (`inUse`), exactly like the category tree's own check.
 *
 * A bank is referenced by movements, by fixed bills and by investments; a card
 * only by the first two.
 */
@Injectable()
export class BankUsageResolver {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly recurrenceRepository: PrismaRecurrenceRepository,
    private readonly investmentRepository: PrismaInvestmentRepository,
  ) {}

  async bankInUse(bankId: string): Promise<boolean> {
    const [inMovements, inRecurrences, inInvestments] = await Promise.all([
      this.transactionRepository.existsByBank(bankId),
      this.recurrenceRepository.existsByBank(bankId),
      this.investmentRepository.existsByBank(bankId),
    ])
    return inMovements || inRecurrences || inInvestments
  }

  async cardInUse(cardId: string): Promise<boolean> {
    const [inMovements, inRecurrences] = await Promise.all([
      this.transactionRepository.existsByCard(cardId),
      this.recurrenceRepository.existsByCard(cardId),
    ])
    return inMovements || inRecurrences
  }
}
