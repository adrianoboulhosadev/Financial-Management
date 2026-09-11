'use client'

import { useQueries } from '@tanstack/react-query'
import { api } from '../http/api'
import { shiftPeriod, toPeriod } from '../format/date'
import type { MonthlyReport } from '../types/monthly-report'
import { useMonthRange } from './use-month-range'

export interface IncomeHistoryPoint {
  /** "YYYY-MM". */
  period: string
  cents: number
}

/**
 * What came in over the last few months, for the bar chart that answers "is
 * this month normal?".
 *
 * It never reaches back past the month the account was created: a bar for a
 * month the owner was not here would read as "you earned nothing then", which
 * is a claim, not an absence. A brand-new account simply shows fewer bars.
 *
 * It reuses the SAME query key the dashboard's monthly report uses, so the month
 * already on screen costs nothing to add here — react-query serves it from
 * cache instead of refetching it. That is the whole reason this is a handful of
 * small queries rather than one new endpoint: the data already exists, already
 * has a cache entry, and a `/report/income-history` route would be a second
 * source of truth for a number the report already carries.
 */
export function useIncomeHistory(months = 6, until = toPeriod()) {
  const { min } = useMonthRange()

  const periods = Array.from({ length: months }, (_, index) =>
    shiftPeriod(until, index - (months - 1)),
  ).filter((period) => period >= min)

  const results = useQueries({
    queries: periods.map((period) => ({
      queryKey: ['report', period],
      queryFn: async (): Promise<MonthlyReport> =>
        (await api().get<MonthlyReport>('/report/monthly', { params: { period } })).data,
    })),
  })

  return {
    loading: results.some((result) => result.isLoading),
    points: periods.map((period, index): IncomeHistoryPoint => {
      const report = results[index].data
      return {
        period,
        cents: (report?.plannedIncomeCents ?? 0) + (report?.realizedIncomeCents ?? 0),
      }
    }),
  }
}
