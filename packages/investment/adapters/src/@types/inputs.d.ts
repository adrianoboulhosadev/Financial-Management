/**
 * The ownerId is NOT in any of these: it is resolved from the JWT at the HTTP
 * boundary and passed separately (anti-IDOR).
 *
 * Dates arrive as the plain 'YYYY-MM-DD' the front sends — that form parses as
 * UTC midnight, which is exactly the day-granularity the domain stores.
 */
export interface CreateInvestmentInput {
  // Optional: an investment held at a broker the owner never registered as a
  // bank still belongs on the list.
  bankId?: string | null
  name: string
  // See INVESTMENT_KINDS.
  kind: string
  // INTEGER CENTS.
  investedAmount: number
  currentAmount?: number | null
  startedOn: string
  maturityOn?: string | null
  notes?: string | null
}

/** Omit a key to leave that field unchanged. */
export interface UpdateInvestmentInput {
  bankId?: string | null
  name?: string
  kind?: string
  investedAmount?: number
  currentAmount?: number | null
  startedOn?: string
  maturityOn?: string | null
  notes?: string | null
}

export interface SetInvestmentActiveInput {
  active: boolean
}
