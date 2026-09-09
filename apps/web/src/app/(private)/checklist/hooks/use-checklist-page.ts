'use client'

import { useState } from 'react'
import type { ChecklistItemDTO } from '@transaction/adapters'

import { toCents, toPeriod, useCategories, useChecklist } from 'ui'

/**
 * The screen's own state — which month, and which bill is having its amount
 * typed right now — composed with the shared data hook. Only ONE row is ever
 * being edited, so the draft is a single id/value pair rather than a map: a
 * second row opening closes the first, which is also what the owner expects.
 */
export function useChecklistPage() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftAmount, setDraftAmount] = useState('')
  const data = useChecklist(period)
  const { pathOf } = useCategories()

  const closeEditor = () => {
    setEditingId(null)
    setDraftAmount('')
  }

  return {
    period,
    setPeriod,
    items: data.items,
    loading: data.loading,
    totalCents: data.totalCents,
    paidCents: data.paidCents,
    pendingCents: data.pendingCents,
    setPaid: data.setPaid,
    editingId,
    draftAmount,
    setDraftAmount,
    /** Opens the editor pre-filled with what the month currently costs, so
     * correcting a bill by a few reais is not retyping it from scratch. */
    startEditing: (item: ChecklistItemDTO) => {
      setEditingId(item.recurrenceId)
      setDraftAmount((item.amountCents / 100).toFixed(2).replace('.', ','))
    },
    cancelEditing: closeEditor,
    confirmEditing: () => {
      if (!editingId) return
      data.adjustAmount(editingId, toCents(draftAmount))
      closeEditor()
    },
    /** Back to the recurrence's own estimate — what the row said before anyone
     * corrected it. */
    clearAdjustment: (item: ChecklistItemDTO) => {
      data.adjustAmount(item.recurrenceId, null)
      closeEditor()
    },
    adjusting: data.adjusting,
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
