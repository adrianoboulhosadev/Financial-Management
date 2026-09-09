'use client'

import { useState } from 'react'
import type { CreateInvestmentInput } from '@investment/adapters'
import { toCents, toDateInputValue } from 'ui'

interface InvestmentFormFields {
  name: string
  kind: string
  bankId: string
  // Typed in reais; converted to cents on submit.
  investedAmount: string
  currentAmount: string
  startedOn: string
  maturityOn: string
  notes: string
}

const emptyForm = (): InvestmentFormFields => ({
  name: '',
  kind: 'cdb',
  bankId: '',
  investedAmount: '',
  currentAmount: '',
  startedOn: toDateInputValue(),
  maturityOn: '',
  notes: '',
})

/** The new-investment form's own state. Everything but name, kind, amount and
 * start date is optional — the product should not refuse to record an
 * investment because the owner does not remember its maturity. */
export function useInvestmentForm(onSubmit: (input: CreateInvestmentInput) => void) {
  const [fields, setFields] = useState<InvestmentFormFields>(emptyForm)

  const patch = (changes: Partial<InvestmentFormFields>) =>
    setFields((current) => ({ ...current, ...changes }))

  return {
    fields,
    patch,
    canSubmit: fields.name.trim().length > 0 && Boolean(fields.investedAmount) && Boolean(fields.startedOn),
    submit: () => {
      onSubmit({
        name: fields.name,
        kind: fields.kind,
        bankId: fields.bankId || null,
        investedAmount: toCents(fields.investedAmount),
        // Absent means "worth what went in" to the domain, which is not the
        // same as being worth zero.
        currentAmount: fields.currentAmount ? toCents(fields.currentAmount) : null,
        startedOn: fields.startedOn,
        maturityOn: fields.maturityOn || null,
        notes: fields.notes.trim() || null,
      })
      setFields(emptyForm())
    },
  }
}
