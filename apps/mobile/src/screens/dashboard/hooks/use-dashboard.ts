import { useState } from 'react'
import { toPeriod } from 'ui'
import { useCategories, useMonthlyReport } from 'client'

export function useDashboard() {
  // The period is owned here, not by the picker: the report query keys off it.
  const [period, setPeriod] = useState(() => toPeriod())
  const { report, loading } = useMonthlyReport(period)
  const { pathOf } = useCategories()

  return {
    period,
    setPeriod,
    report,
    loading,
    // Names live in the `category` context and the report only carries ids.
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
