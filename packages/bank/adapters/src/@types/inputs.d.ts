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
  // The network printed on it — see CARD_BRANDS. It is what identifies the
  // card on screen, which is why there is no nickname.
  brand: string
  // 'debit' | 'credit' | 'both'
  kind: string
  // Exactly four digits — the only part of the number the product ever holds.
  lastFourDigits: string
}

export interface UpdateCardInput {
  brand?: string
  kind?: string
  lastFourDigits?: string
}
