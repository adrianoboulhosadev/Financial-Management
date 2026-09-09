'use client'

import { useState } from 'react'
import type { CreateCardInput } from '@bank/adapters'

/** The new-card form's own state. `lastFourDigits` keeps only digits as the
 * owner types — the full number never belongs in this product, so the field
 * cannot accept one even by accident. */
export function useCardForm(bankId: string, onSubmit: (input: CreateCardInput) => void) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState('credit')
  const [lastFourDigits, setLastFourDigits] = useState('')

  return {
    name,
    setName,
    kind,
    setKind,
    lastFourDigits,
    setLastFourDigits: (value: string) => setLastFourDigits(value.replace(/\D/g, '').slice(0, 4)),
    canSubmit: name.trim().length > 0 && lastFourDigits.length === 4,
    submit: () => {
      onSubmit({ bankId, name, kind, lastFourDigits })
      setName('')
      setKind('credit')
      setLastFourDigits('')
    },
  }
}
