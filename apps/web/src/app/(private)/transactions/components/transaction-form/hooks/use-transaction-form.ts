'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { RecordTransactionInput, TransactionType } from '@transaction/adapters'
import { toCents } from '@/lib/money'
import { toDateInputValue } from '@/lib/date'

interface TransactionFormFields {
  type: TransactionType
  categoryId: string
  description: string
  // Typed in reais; converted to cents on submit (see lib/money).
  amount: string
  occurredOn: string
}

const emptyForm = (): TransactionFormFields => ({
  type: 'expense',
  categoryId: '',
  description: '',
  amount: '',
  occurredOn: toDateInputValue(),
})

export function useTransactionForm(onSubmit: (input: RecordTransactionInput) => void) {
  const form = useForm<TransactionFormFields>({ defaultValues: emptyForm() })
  const [categoryId, setCategoryId] = useState('')
  const type = form.watch('type')

  const submit = form.handleSubmit((fields) => {
    onSubmit({
      type: fields.type,
      // An income may legitimately have none; an expense without one is
      // refused by the domain, and the field below marks it required.
      categoryId: categoryId || null,
      description: fields.description,
      amount: toCents(fields.amount),
      occurredOn: fields.occurredOn,
    })
    form.reset(emptyForm())
    setCategoryId('')
  })

  return {
    form,
    submit,
    type,
    categoryId,
    setCategoryId,
    // Only an expense must land on a category — that is the tree's whole point.
    categoryRequired: type === 'expense',
  }
}
