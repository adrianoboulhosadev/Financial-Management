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
  const [editing, setEditing] = useState<TransactionDTO | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
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
    setAttachmentUrl(null)
  }

  /** Fills the form with a movement so it can be corrected instead of retyped.
   * In reais, because that is the shape the money field edits. */
  const fillFrom = (transaction: TransactionDTO) => {
    setType(transaction.type)
    setDescription(transaction.description)
    setAmount((transaction.amount / 100).toFixed(2).replace('.', ','))
    setCategoryId(transaction.categoryId ?? '')
    setOccurredOn(toDateInputValue(transaction.occurredOn))
    setBankId(transaction.bankId ?? '')
    setCardId(transaction.cardId ?? '')
    setPaymentMethod(transaction.paymentMethod ?? '')
    setInstallments(String(transaction.installments))
    setAttachmentUrl(transaction.attachmentUrl)
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
    /** One sheet serves both: recording a new movement is editing nothing,
     * which is why `editing` is null rather than a second flag. */
    editing,
    isEditing: editing !== null,
    openForm: () => {
      setEditing(null)
      resetForm()
      setFormOpen(true)
    },
    openEditor: (transaction: TransactionDTO) => {
      setEditing(transaction)
      fillFrom(transaction)
      setFormOpen(true)
    },
    closeForm: () => {
      setFormOpen(false)
      setEditing(null)
      resetForm()
    },
    attachmentUrl,
    setAttachmentUrl,
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
    saving: data.recording || data.updating,
    submit: () => {
      // The TYPE and the SPLIT are not editable — the domain's UpdateTransaction
      // takes neither, so the edit path simply does not send them.
      if (editing) {
        data.update({
          id: editing.id,
          categoryId: categoryId || null,
          description,
          amount: toCents(amount),
          occurredOn,
          attachmentUrl,
          bankId: bankId || null,
          cardId: cardId || null,
          paymentMethod: paymentMethod || null,
        })
      } else {
        data.record({
          type,
          categoryId: categoryId || null,
          description,
          amount: toCents(amount),
          occurredOn,
          attachmentUrl,
          // Empty means "not informed", which the domain stores as null — an
          // empty string would be an unknown payment method.
          bankId: bankId || null,
          cardId: cardId || null,
          paymentMethod: paymentMethod || null,
          installments: paymentMethod === 'credit' ? Number(installments) || 1 : 1,
        })
      }

      setFormOpen(false)
      setEditing(null)
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
