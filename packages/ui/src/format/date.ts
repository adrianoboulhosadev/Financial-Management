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

/** "setembro 2026" — the month as the picker pill spells it, without the "de".
 * The pill is read as a label, not as a sentence, and the preposition is the
 * one word in it that carries nothing. */
export function formatPeriodShort(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).replace(' de ', ' ')
}

/** "09 set" — a day inside a month the screen has already named, so the year
 * and the month's full name would only be restating the header. */
export function formatShortDay(value: Date | string): string {
  return new Date(value)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .replace('.', '')
}

/**
 * How a day heads its group in a listing: "Hoje · 09 set", "Ontem · 08 set",
 * or just "05 set" beyond that.
 *
 * The two recent days are named because that is how the owner thinks about the
 * money that just moved; past those, the date IS the name. Both sides are
 * compared in UTC, matching the day the backend recorded — comparing a
 * UTC-midnight `occurredOn` against a local "today" would label a transaction
 * as yesterday's for anyone west of Greenwich.
 */
export function formatDayHeading(value: Date | string): string {
  const day = toDateInputValue(value)
  const today = toDateInputValue()
  const yesterday = toDateInputValue(new Date(Date.now() - 86_400_000))

  if (day === today) return `Hoje · ${formatShortDay(value)}`
  if (day === yesterday) return `Ontem · ${formatShortDay(value)}`
  return formatShortDay(value)
}
