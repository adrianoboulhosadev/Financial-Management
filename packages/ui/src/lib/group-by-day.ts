import { toDateInputValue } from '../format/date'

export interface DayGroup<T> {
  /** "YYYY-MM-DD" in UTC — the key the rows were bucketed on. */
  day: string
  /** The day itself, for whatever wants to format it. */
  date: Date
  items: T[]
}

/**
 * Buckets a month's rows into days, newest day first, keeping the order the
 * server sent inside each day.
 *
 * The key is the UTC date and not a locale string: `occurredOn` is a DATE
 * column, recorded as the day the money moved, and bucketing on a locally
 * formatted date would move a row into the neighbouring day for any reader west
 * of Greenwich — which is the whole reason the column is a date in the first
 * place.
 */
export function groupByDay<T>(items: T[], dateOf: (item: T) => Date | string): DayGroup<T>[] {
  const buckets = new Map<string, DayGroup<T>>()

  for (const item of items) {
    const raw = dateOf(item)
    const day = toDateInputValue(raw)
    const bucket = buckets.get(day)

    if (bucket) bucket.items.push(item)
    else buckets.set(day, { day, date: new Date(raw), items: [item] })
  }

  return [...buckets.values()].sort((a, b) => b.day.localeCompare(a.day))
}
