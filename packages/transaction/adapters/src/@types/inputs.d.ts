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
  // INTEGER CENTS.
  amount: number
  occurredOn: string
  attachmentUrl?: string | null
}

/** Omit a key to leave that field unchanged. */
export interface UpdateTransactionInput {
  categoryId?: string | null
  description?: string
  amount?: number
  occurredOn?: string
  attachmentUrl?: string | null
}

export interface CreateRecurrenceInput {
  type: string
  categoryId?: string | null
  description: string
  amount: number
  dayOfMonth: number
}

export interface UpdateRecurrenceInput {
  categoryId?: string | null
  description?: string
  amount?: number
  dayOfMonth?: number
}

export interface SetRecurrenceActiveInput {
  active: boolean
}
