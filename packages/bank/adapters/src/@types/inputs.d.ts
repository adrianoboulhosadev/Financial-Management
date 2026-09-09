/** The ownerId is NOT in any of these: it is resolved from the JWT at the HTTP
 * boundary and passed separately (anti-IDOR). */
export interface CreateBankInput {
  name: string
  // Both optional — a name is all the product needs to file a payment under.
  agency?: string | null
  accountNumber?: string | null
}

/** Omit a key to leave that field unchanged. */
export interface UpdateBankInput {
  name?: string
  agency?: string | null
  accountNumber?: string | null
}

export interface CreateCardInput {
  bankId: string
  name: string
  // 'debit' | 'credit' | 'both'
  kind: string
  // Exactly four digits — the only part of the number the product ever holds.
  lastFourDigits: string
}

export interface UpdateCardInput {
  name?: string
  kind?: string
  lastFourDigits?: string
}
