import { Injectable } from '@nestjs/common'
import {
  Investment,
  InvestmentContribution,
  InvestmentContributionRepository,
  InvestmentContributionQueryRepository,
} from '@investment/adapters'
import { PrismaService } from '../db/prisma.service'

@Injectable()
export class PrismaInvestmentContributionRepository
  implements InvestmentContributionRepository, InvestmentContributionQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Filing the contribution and raising the investment it went into are ONE
   * fact, so they share a single database transaction — the port promises it,
   * and this is where the promise is kept. In two calls, a crash in between
   * would either lose the record of where the money went or grow the investment
   * with nothing explaining it.
   */
  async record(contribution: InvestmentContribution, investment: Investment): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.investmentContribution.create({
        data: {
          id: contribution.id.value,
          ownerId: contribution.ownerId,
          investmentId: contribution.investmentId,
          // Reads the cents off the value object — the column is an Int.
          amount: contribution.amount.cents,
          occurredOn: contribution.occurredOn,
        },
      })

      await tx.investment.update({
        where: { id: investment.id.value },
        data: {
          investedAmount: investment.investedAmount.cents,
          currentAmount: investment.currentAmount?.cents ?? null,
        },
      })
    })
  }

  /** One aggregate instead of dragging the month's rows back just to add them
   * up. [from, to) — the same window MonthPeriod builds. */
  async sumInPeriod(ownerId: string, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.investmentContribution.aggregate({
      where: { ownerId, occurredOn: { gte: from, lt: to } },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }
}
