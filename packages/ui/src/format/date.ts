/** Formats a date (Date or ISO string from the API) as a Brazilian date, e.g. "05/08/2026". */
export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

/**
 * Short "how long ago" label for the notification inbox, where the exact
 * timestamp matters far less than the freshness. Falls back to the plain date
 * once a week has passed — "há 34d" stops telling anyone anything.
 */
export function formatRelativeTime(value: Date | string): string {
  const elapsedMs = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(elapsedMs / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `há ${days}d`

  return formatDate(value)
}

/**
 * The value a date input expects: "YYYY-MM-DD", read in UTC. The API sends
 * day-granularity dates as UTC midnight, so reading them locally would shift
 * the field to the previous day for anyone west of Greenwich.
 */
export function toDateInputValue(value: Date | string = new Date()): string {
  return new Date(value).toISOString().slice(0, 10)
}

/** The "YYYY-MM" period a date belongs to, in UTC — the same month the backend
 * would compute for it (see MonthPeriod). */
export function toPeriod(value: Date | string = new Date()): string {
  return new Date(value).toISOString().slice(0, 7)
}

/** "agosto de 2026" — how a period is spelled out on screen. */
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Walks a "YYYY-MM" period by whole months, for the month picker. */
export function shiftPeriod(period: string, months: number): string {
  const [year, month] = period.split('-').map(Number)
  return toPeriod(new Date(Date.UTC(year, month - 1 + months, 1)))
}
