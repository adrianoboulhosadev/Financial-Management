/** READ projection (CQRS) of a source of income. */
export interface IncomeSourceDTO {
  id: string
  ownerId: string
  name: string
  // INTEGER CENTS, per month.
  amount: number
  payday: number
  active: boolean
}

/** What the owner can count on in a month, and where it comes from. */
export interface MonthlyIncomeDTO {
  totalCents: number
  sources: IncomeSourceDTO[]
}
