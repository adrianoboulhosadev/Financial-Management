'use client'

import { useMemo, useState } from 'react'

import { toPeriod, useCategories, useChecklist, useMonthlyReport } from 'ui'
import type { CategoryBar } from '@/components/category-bars'

/** How many categories the ranking shows before the tail is folded into one
 * row. Past this the list stops being read and starts being scrolled. */
const RANKED_CATEGORIES = 6

export function useDashboard() {
  // The period is owned here, not by the picker: three queries key off it.
  const [period, setPeriod] = useState(() => toPeriod())
  const { report, loading } = useMonthlyReport(period)
  const { pathOf } = useCategories()
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

  return {
    period,
    setPeriod,
    report,
    loading,
    bars,
    /** What the month's fixed bills add up to, and how much is still open —
     * the two figures the split bar and its hint are built from. */
    fixedCents: checklist.totalCents,
    pendingFixedCents: checklist.pendingCents,
    // Names live in the `category` context and the report only carries ids, so
    // the label is resolved here from the tree the app already has.
    labelFor,
  }
}
