'use client'

import { useState } from 'react'
import type { TransactionDTO } from '@transaction/adapters'

import {
  caption,
  groupByDay,
  paymentMethodLabel,
  toPeriod,
  type TransactionFilterValue,
  useBanks,
  useCategories,
  useTransactions as useTransactionsData,
} from 'ui'

/**
 * The screen's own state (which month, which filter, what is about to be
 * deleted) composed with the shared data hook. The split is the rule: fetching
 * and writing are identical on both apps and live in `client`; what the SCREEN
 * is currently showing is this app's business.
 */
export function useTransactions() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [filter, setFilter] = useState<TransactionFilterValue>('all')
  const [pendingDeletion, setPendingDeletion] = useState<TransactionDTO | null>(null)
  const [composing, setComposing] = useState(false)
  const [editing, setEditing] = useState<TransactionDTO | null>(null)
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()

  const data = useTransactionsData({
    period,
    type: filter === 'all' ? undefined : filter,
  })

  /** The month as day blocks, which is how the list is read: the eye looks for
   * a day, not for a row. */
  const days = groupByDay(data.transactions, (transaction) => transaction.occurredOn)

  return {
    period,
    setPeriod,
    days,
    /** Whether the sheet is up, and on WHAT. One sheet serves both: recording a
     * new movement is editing nothing, which is why `editing` is null rather
     * than a second flag that could disagree with this one. */
    composing,
    editing,
    openComposer: () => {
      setEditing(null)
      setComposing(true)
    },
    openEditor: (transaction: TransactionDTO) => {
      setEditing(transaction)
      setComposing(true)
    },
    closeComposer: () => {
      setComposing(false)
      setEditing(null)
    },
    filter,
    setFilter,
    transactions: data.transactions,
    loading: data.loading,
    record: (input: Parameters<typeof data.record>[0]) => {
      data.record(input)
      setComposing(false)
    },
    update: (input: Parameters<typeof data.update>[0]) => {
      data.update(input)
      setComposing(false)
      setEditing(null)
    },
    saving: data.recording || data.updating,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
    /**
     * The second line of a row: where it is filed, how it was paid, and which
     * instalment it is. Pure presentation, so it may live in the hook next to
     * the state it reads — every part is optional, and the parts that are
     * missing simply do not show up rather than printing "sem banco".
     */
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
