'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../http/api'
import type { MonthlyReport } from '../types/monthly-report'

/** The composed read that answers "quanto sobra": renda + gastos + tetos do
 * mês, cruzados pelo backend (ver /report/monthly). */
export function useMonthlyReport(period: string) {
  const query = useQuery({
    queryKey: ['report', 'monthly', period],
    queryFn: async (): Promise<MonthlyReport> =>
      (await api().get<MonthlyReport>('/report/monthly', { params: { period } })).data,
  })

  return { report: query.data, loading: query.isLoading }
}
