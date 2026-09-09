import {
  Investment,
  InvestmentContribution,
  InvestmentDTO,
  InvestmentKind,
  InvestmentRepository,
  InvestmentQueryRepository,
  InvestmentContributionRepository,
  InvestmentContributionQueryRepository,
} from '../../src'

interface InvestmentRow {
  id: string
  ownerId: string
  bankId: string | null
  name: string
  kind: InvestmentKind
  investedAmount: number
  currentAmount: number | null
  startedOn: Date
  maturityOn: Date | null
  notes: string | null
  active: boolean
}

interface ContributionRow {
  id: string
  ownerId: string
  investmentId: string
  amount: number
  occurredOn: Date
}

export default class InvestmentRepositoryInMemory
  implements
    InvestmentRepository,
    InvestmentQueryRepository,
    InvestmentContributionRepository,
    InvestmentContributionQueryRepository
{
  readonly investments: InvestmentRow[] = []
  readonly contributions: ContributionRow[] = []

  async findById(id: string): Promise<Investment | null> {
    const row = this.investments.find((investment) => investment.id === id)
    return row ? new Investment(row) : null
  }

  async create(investment: Investment): Promise<void> {
    this.investments.push(this.toRow(investment))
  }

  async update(investment: Investment): Promise<void> {
    const index = this.investments.findIndex((current) => current.id === investment.id.value)
    if (index >= 0) this.investments[index] = this.toRow(investment)
  }

  async delete(id: string): Promise<void> {
    const index = this.investments.findIndex((investment) => investment.id === id)
    if (index >= 0) this.investments.splice(index, 1)
  }

  async existsByName(ownerId: string, name: string): Promise<boolean> {
    return this.investments.some(
      (investment) => investment.ownerId === ownerId && investment.name === name,
    )
  }

  async existsByBank(bankId: string): Promise<boolean> {
    return this.investments.some((investment) => investment.bankId === bankId)
  }

  async listByOwnerQuery(ownerId: string): Promise<InvestmentDTO[]> {
    return this.investments
      .filter((investment) => investment.ownerId === ownerId)
      .map((row) => ({ ...row }))
  }

  /** Both writes together, like the single commit the port promises. */
  async record(contribution: InvestmentContribution, investment: Investment): Promise<void> {
    this.contributions.push({
      id: contribution.id.value,
      ownerId: contribution.ownerId,
      investmentId: contribution.investmentId,
      amount: contribution.amount.cents,
      occurredOn: contribution.occurredOn,
    })
    await this.update(investment)
  }

  async sumInPeriod(ownerId: string, from: Date, to: Date): Promise<number> {
    return this.contributions
      .filter(
        (row) =>
          row.ownerId === ownerId &&
          row.occurredOn.getTime() >= from.getTime() &&
          // Exclusive upper bound, the same window MonthPeriod builds.
          row.occurredOn.getTime() < to.getTime(),
      )
      .reduce((total, row) => total + row.amount, 0)
  }

  private toRow(investment: Investment): InvestmentRow {
    return {
      id: investment.id.value,
      ownerId: investment.ownerId,
      bankId: investment.bankId,
      name: investment.name,
      kind: investment.kind,
      investedAmount: investment.investedAmount.cents,
      currentAmount: investment.currentAmount?.cents ?? null,
      startedOn: investment.startedOn,
      maturityOn: investment.maturityOn,
      notes: investment.notes,
      active: investment.active,
    }
  }
}
