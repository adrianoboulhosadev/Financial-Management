'use client'

import { toPeriod } from '../format/date'
import { useAuth } from '../auth/auth-context'

/**
 * The months this account is allowed to look at.
 *
 * The floor is the month the account was CREATED and the ceiling is the current
 * month, and both exist for the same reason: outside that window there is
 * nothing to show. Paging back to a month before the account existed produced a
 * screen of zeros that reads as "you spent nothing in August" rather than as
 * "you were not here in August" — and a picker that offers 2019 is asking the
 * owner to rule it out themselves.
 *
 * Everything is compared as the plain "YYYY-MM" string. That works because the
 * format is zero-padded and fixed-width, so lexicographic order IS chronological
 * order — no Date objects, no timezone to get wrong.
 */
export function useMonthRange() {
  const { user } = useAuth()

  const max = toPeriod()
  // Before the session loads there is no account to bound against. Falling back
  // to the current month keeps the window valid (a single month) instead of
  // briefly offering every month since 1970.
  const min = user ? toPeriod(user.createdAt) : max

  return {
    /** First month the account can show — the month it was created. */
    min,
    /** Last month the account can show — the current one. */
    max,
    /** Pulls a period back inside the window. Used when the range arrives after
     * the screen already picked a month. */
    clamp: (period: string) => (period < min ? min : period > max ? max : period),
    contains: (period: string) => period >= min && period <= max,
  }
}
