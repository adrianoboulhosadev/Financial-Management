'use client'

import { useMemo, useState } from 'react'

import {
  caption,
  groupByDay,
  paymentMethodLabel,
  toPeriod,
  useBanks,
  useCategories,
  useChecklist,
  useMonthlyReport,
  useTransactions,
} from 'ui'
import type { CategoryBar } from '@/components/category-bars'
import type { DashboardTab } from '../data/tabs'

/** How many categories the ranking shows before the tail is folded into one
 * row. Past this the list stops being read and starts being scrolled. */
const RANKED_CATEGORIES = 6

export function useDashboard() {
  // The period is owned here, not by the picker: four queries key off it.
  const [period, setPeriod] = useState(() => toPeriod())
  const [tab, setTab] = useState<DashboardTab>('timeline')

  const { report, loading } = useMonthlyReport(period)
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()
  const { transactions } = useTransactions({ period })
  // The checklist answers a question the report cannot: how much of the fixed
  // bills is still to pay, which is what turns "saiu 3.400" into something the
  // owner can act on.
  const checklist = useChecklist(period)

  const labelFor = (categoryId: string | null) =>
    categoryId ? pathOf(categoryId) : 'Sem categoria'

  /**
   * The ranking, with everything past the top few folded into a single
   * "Outras" row. Folding rather than truncating is what keeps the bars adding
   * up to the total the screen leads with.
   */
  const bars = useMemo((): CategoryBar[] => {
    const totals = report?.totalByCategory ?? []
    const top = totals.slice(0, RANKED_CATEGORIES).map((total) => ({
      id: total.categoryId ?? 'none',
      label: labelFor(total.categoryId),
      cents: total.spentCents,
    }))
    const restCents = totals
      .slice(RANKED_CATEGORIES)
      .reduce((sum, total) => sum + total.spentCents, 0)

    return restCents > 0 ? [...top, { id: 'rest', label: 'Outras', cents: restCents }] : top
    // `pathOf` is rebuilt on every render of the shared hook; the report is what
    // actually changes, so that is what this tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report])

  /** The month as it happened, one block per day. The days are what the eye
   * scans for, so they head the groups rather than repeating on every row. */
  const days = useMemo(
    () => groupByDay(transactions, (transaction) => transaction.occurredOn),
    [transactions],
  )

  const incomeCents = (report?.plannedIncomeCents ?? 0) + (report?.realizedIncomeCents ?? 0)

  return {
    period,
    setPeriod,
    report,
    loading,
    tab,
    setTab,
    bars,
    days,
    incomeCents,
    /** What the month's fixed bills add up to, and how much is still open —
     * the two figures the pie and its hint are built from. */
    fixedCents: checklist.totalCents,
    pendingFixedCents: checklist.pendingCents,
    /** How much of what came in survived. The screen leads with it as a
     * percentage because "sobrou 2.184" means nothing without the scale. */
    leftoverShare:
      incomeCents > 0 ? Math.round(((report?.leftoverCents ?? 0) / incomeCents) * 100) : 0,
    // Names live in the `category` context and the report only carries ids, so
    // the label is resolved here from the tree the app already has.
    labelFor,
    /** The line under a movement: where it was filed, how it was paid, and
     * whether it is one instalment of something bigger. */
    captionFor: (transaction: {
      categoryId: string | null
      bankId: string | null
      cardId: string | null
      paymentMethod: Parameters<typeof paymentMethodLabel>[0]
      installments: number
      installmentNumber: number
      recurrenceId: string | null
    }) =>
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
