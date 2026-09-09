'use client'

import { useState } from 'react'
import type { CreateBankInput } from '@bank/adapters'

/** The new-bank form's own state. The name is free text with a datalist of
 * suggestions behind it, so anything not on the list is still registerable. */
export function useBankForm(onSubmit: (input: CreateBankInput) => void) {
  const [name, setName] = useState('')
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  return {
    name,
    setName,
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
      setName('')
      setAgency('')
      setAccountNumber('')
    },
  }
}
