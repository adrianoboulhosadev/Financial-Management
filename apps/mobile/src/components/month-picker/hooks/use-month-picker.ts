import { useState } from 'react'
import { shiftPeriod, useMonthRange, yearOf } from 'ui'

/**
 * The picker's own state: whether the sheet is open and WHICH YEAR it is
 * showing — which is not the same as the selected year. Paging to 2025 to look
 * around and then closing without choosing has to leave the selection alone.
 *
 * The same hook shape as the web's, minus the click-outside and Escape wiring:
 * a `Modal` already handles dismissal on this platform.
 */
export function useMonthPicker(period: string, onChange: (period: string) => void) {
  const range = useMonthRange()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => yearOf(period))

  const previous = shiftPeriod(period, -1)
  const next = shiftPeriod(period, 1)

  return {
    open,
    // Opening always lands on the selected month's year, so the sheet never
    // opens somewhere the owner did not leave it.
    show: () => {
      setYear(yearOf(period))
      setOpen(true)
    },
    close: () => setOpen(false),
    year,
    // The year arrows stop where the account does: there is no month to reach
    // in a year entirely outside the window.
    canPreviousYear: year > yearOf(range.min),
    canNextYear: year < yearOf(range.max),
    previousYear: () => setYear((current) => current - 1),
    nextYear: () => setYear((current) => current + 1),
    /** Whether stepping one month that way lands inside the account's window. */
    canGoBack: range.contains(previous),
    canGoForward: range.contains(next),
    goBack: () => range.contains(previous) && onChange(previous),
    goForward: () => range.contains(next) && onChange(next),
    isSelectable: range.contains,
    select: (value: string) => {
      onChange(value)
      setOpen(false)
    },
  }
}
