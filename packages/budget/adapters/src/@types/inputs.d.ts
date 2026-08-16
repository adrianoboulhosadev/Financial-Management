/** The ownerId is resolved from the JWT at the HTTP boundary, never sent by the client. */
export interface SetBudgetInput {
  categoryId: string
  // INTEGER CENTS.
  amount: number
}
