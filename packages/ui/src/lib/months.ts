/**
 * The twelve months of a year as the picker grid lays them out: a short label
 * and the "YYYY-MM" period it stands for.
 *
 * The labels come from `toLocaleDateString` rather than a hand-written array so
 * they stay in the app's language without a second translation to maintain, and
 * the trailing dot pt-BR puts on the abbreviation is stripped — "set." reads as
 * a truncation in a grid where every other cell is three clean letters.
 */
export interface MonthOption {
  /** 1-12. */
  month: number
  /** "YYYY-MM" — what picking this cell selects. */
  period: string
  /** "jan", "fev", … */
  label: string
}

export function monthsOfYear(year: number): MonthOption[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    return {
      month,
      period: `${year}-${String(month).padStart(2, '0')}`,
      label: new Date(Date.UTC(year, index, 1))
        .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
        .replace('.', ''),
    }
  })
}

/** The year half of a "YYYY-MM". */
export function yearOf(period: string): number {
  return Number(period.slice(0, 4))
}
