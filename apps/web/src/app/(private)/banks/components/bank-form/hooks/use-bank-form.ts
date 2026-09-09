'use client'

import { useState } from 'react'
import type { CreateBankInput } from '@bank/adapters'
import { BANK_SUGGESTIONS } from 'ui'

/** The option that reveals the free-text field. A local scalar, so it lives
 * next to the only two files that read it rather than in a `data/` of its own. */
export const OTHER_BANK = '__other__'

/**
 * The new-bank form's own state. The bank is chosen from a real dropdown, with
 * one escape hatch — "Outro" — that reveals a text field: the list is only a
 * shortcut, and a bank nobody listed has to stay registerable.
 *
 * `name` is DERIVED from the two, so there is a single answer to "what is being
 * submitted" instead of two fields that can disagree.
 */
export function useBankForm(onSubmit: (input: CreateBankInput) => void) {
  const [selected, setSelected] = useState('')
  const [customName, setCustomName] = useState('')
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const choosingOther = selected === OTHER_BANK
  const name = choosingOther ? customName : selected

  return {
    suggestions: BANK_SUGGESTIONS,
    selected,
    setSelected,
    choosingOther,
    customName,
    setCustomName,
    agency,
    setAgency,
    accountNumber,
    setAccountNumber,
    canSubmit: name.trim().length > 0,
    submit: () => {
      onSubmit({
        name,
        // Blank and absent mean the same thing to the domain, and only one of
        // them is worth sending.
        agency: agency.trim() || null,
        accountNumber: accountNumber.trim() || null,
      })
      setSelected('')
      setCustomName('')
      setAgency('')
      setAccountNumber('')
    },
  }
}
