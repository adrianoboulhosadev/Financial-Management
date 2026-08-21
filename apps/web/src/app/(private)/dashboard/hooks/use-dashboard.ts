'use client'

import { useState } from 'react'

import { toPeriod, useCategories, useMonthlyReport } from 'ui'

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
    // Names live in the `category` context and the report only carries ids, so
    // the label is resolved here from the tree the app already has.
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
