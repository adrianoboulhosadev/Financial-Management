import { useState } from 'react'
import type { RecurrenceDTO, TransactionType } from '@transaction/adapters'

import {
  SELF_SETTLING_PAYMENT_METHODS,
  paymentMethodLabel,
  toCents,
  useBanks,
  useCategories,
  useRecurrences,
} from 'ui'

export function useRecurrencesScreen() {
  const data = useRecurrences()
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')
  const [variableAmount, setVariableAmount] = useState(false)
  const [autoPaid, setAutoPaid] = useState(false)
  const [bankId, setBankId] = useState('')
  const [cardId, setCardId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<RecurrenceDTO | null>(null)

  return {
    recurrences: data.recurrences,
    loading: data.loading,
    creating: data.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    type,
    setType,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    amount,
    setAmount,
    dayOfMonth,
    setDayOfMonth,
    variableAmount,
    setVariableAmount,
    autoPaid,
    setAutoPaid,
    bankId,
    setBankId,
    cardId,
    setCardId,
    paymentMethod,
    /**
     * Picking pix or direct debit pre-ticks "já é pago automaticamente": it is
     * the answer the owner was going to give anyway, and they can still untick
     * it. Going back to cash or credit unticks it, because those need somebody
     * to actually pay.
     */
    setPaymentMethod: (method: string) => {
      setPaymentMethod(method)
      setAutoPaid(SELF_SETTLING_PAYMENT_METHODS.includes(method as never))
    },
    categoryRequired: type === 'expense',
    canSubmit: Boolean(description.trim() && amount && (type !== 'expense' || categoryId)),
    submit: () => {
      data.create({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        dayOfMonth: Number(dayOfMonth),
        variableAmount,
        autoPaid,
        bankId: bankId || null,
        cardId: cardId || null,
        paymentMethod: paymentMethod || null,
      })
      setFormOpen(false)
      setDescription('')
      setAmount('')
      setCategoryId('')
      setVariableAmount(false)
      setAutoPaid(false)
      setBankId('')
      setCardId('')
      setPaymentMethod('')
    },
    toggleActive: data.toggleActive,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (id: string | null) => (id ? pathOf(id) : 'Sem categoria'),
    /** How a fixed bill's payment reads — the same line the web shows, minus
     * the instalments a recurrence can never have. */
    paymentLabelFor: (recurrence: RecurrenceDTO): string =>
      [
        paymentMethodLabel(recurrence.paymentMethod),
        cardLabelOf(recurrence.cardId) || bankNameOf(recurrence.bankId),
        recurrence.autoPaid ? 'pagamento automático' : '',
      ]
        .filter(Boolean)
        .join(' · '),
  }
}
