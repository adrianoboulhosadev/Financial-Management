import { ValidationError, Errors } from 'shared'

/**
 * Where the money was put. A closed list rather than free text because the
 * screen groups the portfolio by it — free text would give one owner "CDB",
 * "cdb" and "C.D.B." as three different slices of the same pie.
 *
 * `other` is the escape hatch that keeps the list from having to be exhaustive:
 * anything the product has not named yet still lands somewhere honest.
 */
export type InvestmentKind =
  | 'savings'
  | 'cdb'
  | 'lci_lca'
  | 'treasury'
  | 'fund'
  | 'stocks'
  | 'reit'
  | 'crypto'
  | 'pension'
  | 'other'

export const INVESTMENT_KINDS: readonly InvestmentKind[] = [
  'savings',
  'cdb',
  'lci_lca',
  'treasury',
  'fund',
  'stocks',
  'reit',
  'crypto',
  'pension',
  'other',
]

export function assertInvestmentKind(value?: string): InvestmentKind {
  if (!INVESTMENT_KINDS.includes(value as InvestmentKind)) {
    ValidationError.throwError(Errors.INVALID_INVESTMENT_KIND, value)
  }
  return value as InvestmentKind
}
