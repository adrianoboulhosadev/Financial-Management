/**
 * The ownerId is NOT in any of these: it is resolved from the JWT at the HTTP
 * boundary and passed separately (anti-IDOR).
 *
 * Dates arrive as the plain 'YYYY-MM-DD' the front sends. That form parses as
 * UTC midnight, which is exactly the day-granularity the domain stores — a full
 * ISO timestamp with an offset could land on the previous day.
 */
export interface RecordTransactionInput {
  type: string
  categoryId?: string | null
  description: string
  // INTEGER CENTS. On a split purchase this is the TOTAL, never one instalment.
  amount: number
  occurredOn: string
  attachmentUrl?: string | null
  // Where the money went through and how — see PAYMENT_METHODS.
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
  // How many months a credit purchase is split over; 1 (or absent) is the
  // ordinary case.
  installments?: number
}

/** Omit a key to leave that field unchanged. The instalment split is fixed at
 * creation, so it is deliberately not here. */
export interface UpdateTransactionInput {
  categoryId?: string | null
  description?: string
  amount?: number
  occurredOn?: string
  attachmentUrl?: string | null
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
}

export interface CreateRecurrenceInput {
  type: string
  categoryId?: string | null
  description: string
  // For a variable bill this is the owner's ESTIMATE.
  amount: number
  dayOfMonth: number
  // Declared at creation and never editable — see the Recurrence entity.
  variableAmount?: boolean
  autoPaid?: boolean
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
}

export interface UpdateRecurrenceInput {
  categoryId?: string | null
  description?: string
  amount?: number
  dayOfMonth?: number
  autoPaid?: boolean
  bankId?: string | null
  cardId?: string | null
  paymentMethod?: string | null
}

export interface SetRecurrenceActiveInput {
  active: boolean
}

/** Ticks one month of one fixed bill off the checklist, or un-ticks it. */
export interface SetRecurrencePaidInput {
  // YYYY-MM.
  period: string
  paid: boolean
}

/** What a VARIABLE bill actually came to in one month. `null` clears the
 * adjustment and puts the estimate back in charge. */
export interface AdjustRecurrenceAmountInput {
  period: string
  amount: number | null
}
