'use client'

import { useState } from 'react'
import type { InvestmentDTO } from '@investment/adapters'

import {
  caption,
  formatShortDay,
  INVESTMENT_KIND_LABELS,
  toCents,
  toPeriod,
  useBanks,
  useInvestments,
  useMonthlyReport,
} from 'ui'

/**
 * The screen's own state (which investment is having its current value typed,
 * what is about to be deleted) composed with the shared data hook.
 *
 * Only ONE row is ever being edited, so the draft is a single id/value pair
 * rather than a map — a second row opening closes the first, which is what the
 * owner expects anyway.
 */
export function useInvestmentsPage() {
  const data = useInvestments()
  const { bankNameOf } = useBanks()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftValue, setDraftValue] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<InvestmentDTO | null>(null)
  const [composing, setComposing] = useState(false)
  // What the month still has free. It belongs on THIS screen because deciding
  // where the leftover goes is the next thought after reading it, and the
  // answer is one of the rows below.
  const { report } = useMonthlyReport(toPeriod())

  const closeEditor = () => {
    setEditingId(null)
    setDraftValue('')
  }

  return {
    investments: data.investments,
    portfolio: data.portfolio,
    loading: data.loading,
    leftoverCents: report?.leftoverCents ?? 0,
    investedThisMonthCents: report?.investedCents ?? 0,
    composing,
    openComposer: () => setComposing(true),
    closeComposer: () => setComposing(false),
    create: (input: Parameters<typeof data.create>[0]) => {
      data.create(input)
      setComposing(false)
    },
    creating: data.creating,
    toggleActive: data.toggleActive,
    editingId,
    draftValue,
    setDraftValue,
    /** Opens pre-filled with what it is worth today, so a monthly update is a
     * two-character edit rather than retyping the figure. */
    startEditing: (investment: InvestmentDTO) => {
      setEditingId(investment.id)
      const cents = investment.currentAmount ?? investment.investedAmount
      setDraftValue((cents / 100).toFixed(2).replace('.', ','))
    },
    cancelEditing: closeEditor,
    confirmEditing: () => {
      if (!editingId) return
      data.updateValue(editingId, toCents(draftValue))
      closeEditor()
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    /** Names live in the `bank` context and an investment only carries an id —
     * and it may carry none at all, which reads as nothing rather than as
     * "sem banco". */
    bankNameOf,
    /** What one investment made so far, in cents. SIGNED, because a loss is
     * exactly what has to be visible. Pure presentation of two figures the row
     * already has. */
    returnOf: (investment: InvestmentDTO) =>
      (investment.currentAmount ?? investment.investedAmount) - investment.investedAmount,
    /** The line under an investment's name: what kind it is, where it is, and
     * the dates that matter. */
    captionFor: (investment: InvestmentDTO) =>
      caption(
        INVESTMENT_KIND_LABELS[investment.kind],
        bankNameOf(investment.bankId),
        `desde ${formatShortDay(investment.startedOn)}`,
        investment.maturityOn && `vence ${formatShortDay(investment.maturityOn)}`,
        !investment.active && 'resgatado',
      ),
  }
}
