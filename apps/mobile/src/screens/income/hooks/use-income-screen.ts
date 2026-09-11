import { useState } from 'react'
import type { IncomeSourceDTO } from '@income/adapters'

import {
  caption,
  formatShortDay,
  toCents,
  toPeriod,
  useBanks,
  useIncome,
  useIncomeHistory,
  useTransactions,
} from 'ui'

export function useIncomeScreen() {
  const data = useIncome()
  const period = toPeriod()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [payday, setPayday] = useState('5')
  const [pendingDeletion, setPendingDeletion] = useState<IncomeSourceDTO | null>(null)
  const { bankNameOf, cardLabelOf } = useBanks()

  // The one-off income of the month — what was received that no source
  // predicts. It sits beside the fixed sources because the question the screen
  // answers is "what came in", and half the answer living on another screen
  // would be the same as not answering it.
  const { transactions } = useTransactions({ period, type: 'income' })
  const history = useIncomeHistory(6, period)

  const realizedCents = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const averageCents = Math.round(
    history.points.reduce((sum, point) => sum + point.cents, 0) / Math.max(history.points.length, 1),
  )
  const currentCents = history.points.at(-1)?.cents ?? 0

  return {
    sources: data.sources,
    /** The PLANNED side: what the active sources promise every month. */
    monthlyTotal: data.monthlyTotal,
    /** What actually landed as a one-off this month. */
    realizedCents,
    totalCents: data.monthlyTotal + realizedCents,
    oneOffs: transactions,
    history: history.points,
    averageCents,
    /** How this month compares with the average, as a percentage. Null when
     * there is no history to compare against. */
    versusAverage:
      averageCents > 0 ? Math.round(((currentCents - averageCents) / averageCents) * 100) : null,
    loading: data.loading,
    creating: data.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    name,
    setName,
    amount,
    setAmount,
    payday,
    setPayday,
    canSubmit: Boolean(name.trim() && amount),
    submit: () => {
      data.create({ name, amount: toCents(amount), payday: Number(payday) })
      setFormOpen(false)
      setName('')
      setAmount('')
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
    /** "todo dia 01 · em pausa" — when the money is expected, and whether it is
     * still expected at all. */
    sourceCaptionFor: (source: IncomeSourceDTO) =>
      caption(`todo dia ${String(source.payday).padStart(2, '0')}`, !source.active && 'em pausa'),
    /** "08 set · Pix Itaú" — when a one-off landed and through what. */
    oneOffCaptionFor: (transaction: (typeof transactions)[number]) =>
      caption(
        formatShortDay(transaction.occurredOn),
        cardLabelOf(transaction.cardId) || bankNameOf(transaction.bankId),
      ),
  }
}
