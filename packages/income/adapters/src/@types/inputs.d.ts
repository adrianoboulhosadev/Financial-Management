/** The ownerId is resolved from the JWT at the HTTP boundary, never sent by the client. */
export interface CreateIncomeSourceInput {
  name: string
  // INTEGER CENTS, per month.
  amount: number
  payday: number
}

/** Omit a key to leave that field unchanged. */
export interface UpdateIncomeSourceInput {
  name?: string
  amount?: number
  payday?: number
}

export interface SetIncomeSourceActiveInput {
  active: boolean
}
