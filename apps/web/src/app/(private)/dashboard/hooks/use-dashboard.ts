'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toPeriod } from '@/lib/date'
import { useCategories } from '@/hooks/use-categories'
import type { MonthlyReport } from '../types/monthly-report'

export function useDashboard() {
  // The period is owned here, not by the picker: two queries key off it.
  const [period, setPeriod] = useState(() => toPeriod())
  const { pathOf } = useCategories()

  const query = useQuery({
    queryKey: ['report', 'monthly', period],
    queryFn: async (): Promise<MonthlyReport> =>
      (await api.get<MonthlyReport>('/report/monthly', { params: { period } })).data,
  })

  return {
    period,
    setPeriod,
    report: query.data,
    loading: query.isLoading,
    // Names live in the `category` context and the report only carries ids, so
    // the label is resolved here from the tree the app already has.
    labelFor: (categoryId: string | null) => (categoryId ? pathOf(categoryId) : 'Sem categoria'),
  }
}
