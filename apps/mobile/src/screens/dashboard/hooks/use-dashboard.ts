import { useState } from 'react'

import { toPeriod, useCategories, useChecklist, useMonthlyReport } from 'ui'

export function useDashboard() {
  // The period is owned here, not by the picker: three queries key off it.
  const [period, setPeriod] = useState(() => toPeriod())
  const { report, loading } = useMonthlyReport(period)
  const { pathOf } = useCategories()
  // The checklist answers a question the report cannot: how much of the fixed
  // bills is still to pay, which is what turns "saiu 3.400" into something the
  // owner can act on.
  const checklist = useChecklist(period)

  return {
    period,
    setPeriod,
    report,
    loading,
    /** What the month's fixed bills add up to, and how much is still open. */
    fixedCents: checklist.totalCents,
    pendingFixedCents: checklist.pendingCents,
    // Names live in the `category` context and the report only carries ids.
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
