'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { RecordTransactionInput, TransactionType } from '@transaction/adapters'
import { toCents } from 'ui'
import { toDateInputValue } from 'ui'

interface TransactionFormFields {
  type: TransactionType
  categoryId: string
  description: string
  // Typed in reais; converted to cents on submit (see lib/money). On a split
  // purchase this is the TOTAL — the backend divides it.
  amount: string
  occurredOn: string
}

/** The payment block's own state. Kept apart from react-hook-form because the
 * three pickers depend on each other (a card belongs to a bank, instalments
 * only to credit) and clearing one from another is far clearer as plain state. */
interface PaymentFormFields {
  bankId: string
  paymentMethod: string
  cardId: string
  installments: string
}

const emptyForm = (): TransactionFormFields => ({
  type: 'expense',
  categoryId: '',
  description: '',
  amount: '',
  occurredOn: toDateInputValue(),
})

const emptyPayment = (): PaymentFormFields => ({
  bankId: '',
  paymentMethod: '',
  cardId: '',
  installments: '1',
})

export function useTransactionForm(onSubmit: (input: RecordTransactionInput) => void) {
  const form = useForm<TransactionFormFields>({ defaultValues: emptyForm() })
  const [categoryId, setCategoryId] = useState('')
  const [payment, setPayment] = useState<PaymentFormFields>(emptyPayment)
  const type = form.watch('type')

  const patchPayment = (fields: Partial<PaymentFormFields>) =>
    setPayment((current) => ({ ...current, ...fields }))

  const submit = form.handleSubmit((fields) => {
    onSubmit({
      type: fields.type,
      // An income may legitimately have none; an expense without one is
      // refused by the domain, and the field below marks it required.
      categoryId: categoryId || null,
      description: fields.description,
      amount: toCents(fields.amount),
      occurredOn: fields.occurredOn,
      // Empty means "not informed", which the domain stores as null — an empty
      // string would be an unknown payment method.
      bankId: payment.bankId || null,
      cardId: payment.cardId || null,
      paymentMethod: payment.paymentMethod || null,
      installments: payment.paymentMethod === 'credit' ? Number(payment.installments) || 1 : 1,
    })
    form.reset(emptyForm())
    setCategoryId('')
    setPayment(emptyPayment())
  })

  return {
    form,
    submit,
    type,
    categoryId,
    setCategoryId,
    payment,
    setBankId: (bankId: string) => patchPayment({ bankId }),
    setPaymentMethod: (paymentMethod: string) => patchPayment({ paymentMethod }),
    setCardId: (cardId: string) => patchPayment({ cardId }),
    setInstallments: (installments: string) => patchPayment({ installments }),
    // Only an expense must land on a category — that is the tree's whole point.
    categoryRequired: type === 'expense',
  }
}
