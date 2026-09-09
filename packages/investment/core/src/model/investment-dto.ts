import { InvestmentKind } from './investment-kind'

/** READ projection (CQRS) of an investment. Plain interface — no entity, no
 * value objects. The derived numbers travel WITH it so the two fronts never
 * re-derive a return each in their own way. */
export interface InvestmentDTO {
  id: string
  ownerId: string
  bankId: string | null
  name: string
  kind: InvestmentKind
  // INTEGER CENTS.
  investedAmount: number
  currentAmount: number | null
  startedOn: Date
  maturityOn: Date | null
  notes: string | null
  active: boolean
}

/** READ projection of one contribution ("aporte"). */
export interface InvestmentContributionDTO {
  id: string
  ownerId: string
  investmentId: string
  amount: number
  occurredOn: Date
}

/** What one kind of investment holds inside the portfolio. */
export interface PortfolioSliceDTO {
  kind: InvestmentKind
  investedCents: number
  valueCents: number
  returnCents: number
}

/** The whole portfolio, as the screen leads with it: what went in, what it is
 * worth, what it made — plus the same split per kind. */
export interface PortfolioDTO {
  investedCents: number
  valueCents: number
  // SIGNED: a portfolio in the red is exactly what the owner needs to see.
  returnCents: number
  byKind: PortfolioSliceDTO[]
  investments: InvestmentDTO[]
}
