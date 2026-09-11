import { useState } from 'react'
import type { TransactionDTO, TransactionType } from '@transaction/adapters'

import {
  caption,
  groupByDay,
  paymentMethodLabel,
  toCents,
  toDateInputValue,
  toPeriod,
  type TransactionFilterValue,
  useBanks,
  useCategories,
  useTransactions,
} from 'ui'

/**
 * The screen's own state (which month, which filter, the form, what is about to
 * be deleted) composed with the shared data hook — the same split the web makes.
 */
export function useTransactionsScreen() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [filter, setFilter] = useState<TransactionFilterValue>('all')
  const [pendingDeletion, setPendingDeletion] = useState<TransactionDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => toDateInputValue())
  const [bankId, setBankId] = useState('')
  const [cardId, setCardId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [installments, setInstallments] = useState('1')
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()

  const data = useTransactions({ period, type: filter === 'all' ? undefined : filter })

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setCategoryId('')
    setOccurredOn(toDateInputValue())
    setBankId('')
    setCardId('')
    setPaymentMethod('')
    setInstallments('1')
  }

  /** The month as day blocks, which is how the list is read: the eye looks for
   * a day, not for a row. */
  const days = groupByDay(data.transactions, (transaction) => transaction.occurredOn)

  return {
    period,
    setPeriod,
    filter,
    setFilter,
    days,
    transactions: data.transactions,
    loading: data.loading,
    recording: data.recording,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => {
      setFormOpen(false)
      resetForm()
    },
    type,
    setType,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    amount,
    setAmount,
    occurredOn,
    setOccurredOn,
    bankId,
    setBankId,
    cardId,
    setCardId,
    paymentMethod,
    setPaymentMethod,
    installments,
    setInstallments,
    // Only an expense must land on a category — that is the tree's whole point.
    categoryRequired: type === 'expense',
    canSubmit: Boolean(description.trim() && amount && (type !== 'expense' || categoryId)),
    submit: () => {
      data.record({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        occurredOn,
        // Empty means "not informed", which the domain stores as null — an
        // empty string would be an unknown payment method.
        bankId: bankId || null,
        cardId: cardId || null,
        paymentMethod: paymentMethod || null,
        installments: paymentMethod === 'credit' ? Number(installments) || 1 : 1,
      })
      setFormOpen(false)
      resetForm()
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
    /** The line under a row: where it is filed, how it was paid, and which
     * instalment it is — the same caption the web builds from the same pieces.
     * Every part is optional, and the missing ones simply do not show up rather
     * than printing "sem banco". */
    captionFor: (transaction: TransactionDTO): string =>
      caption(
        transaction.categoryId ? pathOf(transaction.categoryId) : 'Sem categoria',
        cardLabelOf(transaction.cardId) ||
          caption(paymentMethodLabel(transaction.paymentMethod), bankNameOf(transaction.bankId)),
        transaction.installments > 1 &&
          `${transaction.installmentNumber} de ${transaction.installments}`,
        transaction.recurrenceId && 'fixo',
      ),
  }
}
