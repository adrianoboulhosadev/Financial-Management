import { useState } from 'react'
import type { ChecklistItemDTO } from '@transaction/adapters'

import { caption, formatShortDay, toCents, toPeriod, useCategories, useChecklist } from 'ui'

/**
 * The screen's own state — which month, and which bill is having its amount
 * typed right now — composed with the shared data hook. Identical split to the
 * web's, which is what keeps the two screens answering the same way. Only ONE row is ever
 * being edited, so the draft is a single id/value pair rather than a map: a
 * second row opening closes the first, which is also what the owner expects.
 */
export function useChecklistScreen() {
  const [period, setPeriod] = useState(() => toPeriod())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftAmount, setDraftAmount] = useState('')
  const data = useChecklist(period)
  const { pathOf } = useCategories()

  const closeEditor = () => {
    setEditingId(null)
    setDraftAmount('')
  }

  /** The list splits by whether the month still owes it: what is open is the
   * reason the screen is opened, and what is settled is the receipt. */
  const open = data.items.filter((item) => !item.paid)
  const settled = data.items.filter((item) => item.paid)

  return {
    period,
    setPeriod,
    items: data.items,
    open,
    settled,
    /** How much of the month is done, as a bar: settled money over the whole,
     * which is a fairer picture than counting lines of wildly different size. */
    settledPercentage:
      data.totalCents > 0 ? Math.round((data.paidCents / data.totalCents) * 100) : 0,
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
    /** The line under a bill's name: when it falls due (or when it was
     * settled), and the handful of things worth saying about it. */
    captionFor: (item: ChecklistItemDTO) =>
      caption(
        item.paid
          ? item.autoPaid
            ? `débito automático · ${formatShortDay(item.dueOn)}`
            : `pago em ${formatShortDay(item.dueOn)}`
          : `vence ${formatShortDay(item.dueOn)}`,
        !item.paid && item.variableAmount && 'valor variável',
        // It leaves the list next month, so say it before it just disappears.
        item.lastMonth && 'último mês',
        item.posted && 'já lançado',
      ),
  }
}
