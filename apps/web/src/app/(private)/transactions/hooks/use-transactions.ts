'use client'

import { useState } from 'react'
import type { TransactionDTO } from '@transaction/adapters'

import {
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
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()

  const data = useTransactionsData({
    period,
    type: filter === 'all' ? undefined : filter,
  })

  return {
    period,
    setPeriod,
    filter,
    setFilter,
    transactions: data.transactions,
    loading: data.loading,
    record: data.record,
    recording: data.recording,
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
     * The second line of a row: how it was paid, through what, and which
     * instalment it is. Pure presentation, so it may live in the hook next to
     * the state it reads — every part is optional, and the parts that are
     * missing simply do not show up rather than printing "sem banco".
     */
    paymentLabelFor: (transaction: TransactionDTO): string =>
      [
        paymentMethodLabel(transaction.paymentMethod),
        cardLabelOf(transaction.cardId) || bankNameOf(transaction.bankId),
        transaction.installments > 1
          ? `${transaction.installmentNumber}/${transaction.installments}`
          : '',
      ]
        .filter(Boolean)
        .join(' · '),
  }
}
