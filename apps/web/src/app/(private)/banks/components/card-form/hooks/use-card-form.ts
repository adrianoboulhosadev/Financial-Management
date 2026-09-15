'use client'

import { useEffect, useState } from 'react'
import type { CardDTO, CreateCardInput, UpdateCardInput } from '@bank/adapters'
import { kindAllowsCredit, toCents } from 'ui'

interface UseCardFormInput {
  bankId: string
  onCreate: (input: CreateCardInput) => void
  onUpdate: (input: UpdateCardInput & { id: string }) => void
  /** The card being edited, or null to register a new one. */
  editing: CardDTO | null
}

const blank = { brand: 'visa', kind: 'credit', lastFourDigits: '', limit: '', closingDay: '', dueDay: '' }

/**
 * The card form's own state. It serves CREATING and EDITING, because the
 * questions are identical — and editing is the only way a card registered
 * before invoices existed ever gets its calendar.
 *
 * `lastFourDigits` keeps only digits as the owner types: the full number never
 * belongs in this product, so the field cannot accept one even by accident.
 * The two calendar days are capped the same way, for the same reason — a field
 * that refuses what the domain refuses never has to explain itself.
 */
export function useCardForm({ bankId, onCreate, onUpdate, editing }: UseCardFormInput) {
  const [form, setForm] = useState(blank)

  // Keyed on the card's ID, never on the object: `editing` is a row out of a
  // query that refetches, and re-running on a new reference would wipe what the
  // owner is in the middle of typing.
  useEffect(() => {
    if (!editing) return setForm(blank)
    setForm({
      brand: editing.brand,
      kind: editing.kind,
      lastFourDigits: editing.lastFourDigits,
      limit: editing.limitCents === null ? '' : String(editing.limitCents / 100).replace('.', ','),
      closingDay: editing.closingDay === null ? '' : String(editing.closingDay),
      dueDay: editing.dueDay === null ? '' : String(editing.dueDay),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id ?? null])

  const set = (fields: Partial<typeof blank>) => setForm((current) => ({ ...current, ...fields }))
  const onCredit = kindAllowsCredit(form.kind)
  // Both days or neither: half a calendar is not half an invoice, it is no
  // invoice, and the domain refuses it.
  const calendarComplete = (form.closingDay === '') === (form.dueDay === '')

  return {
    ...form,
    editing: editing !== null,
    onCredit,
    setBrand: (brand: string) => set({ brand }),
    setKind: (kind: string) => set({ kind }),
    setLastFourDigits: (value: string) => set({ lastFourDigits: value.replace(/\D/g, '').slice(0, 4) }),
    setLimit: (limit: string) => set({ limit }),
    setClosingDay: (value: string) => set({ closingDay: day(value) }),
    setDueDay: (value: string) => set({ dueDay: day(value) }),
    canSubmit: form.lastFourDigits.length === 4 && calendarComplete,
    submit: () => {
      // A card that no longer settles on credit has its calendar and limit
      // CLEARED in the same request — the entity refuses to keep them, and
      // sending them anyway would turn a valid edit into a 400.
      const credit = {
        closingDay: onCredit && form.closingDay ? Number(form.closingDay) : null,
        dueDay: onCredit && form.dueDay ? Number(form.dueDay) : null,
        limitCents: onCredit && form.limit ? toCents(form.limit) : null,
      }

      if (editing) onUpdate({ id: editing.id, brand: form.brand, kind: form.kind, lastFourDigits: form.lastFourDigits, ...credit })
      else onCreate({ bankId, brand: form.brand, kind: form.kind, lastFourDigits: form.lastFourDigits, ...credit })

      setForm(blank)
    },
  }
}

/** 1-31, as the owner types it — the same window the domain accepts. */
function day(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 2)
  if (digits === '' || Number(digits) <= 31) return digits
  return '31'
}
