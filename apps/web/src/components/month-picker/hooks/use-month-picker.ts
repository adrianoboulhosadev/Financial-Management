'use client'

import { useEffect, useRef, useState } from 'react'
import { shiftPeriod, useMonthRange, yearOf } from 'ui'

/**
 * The picker's own state: whether the panel is open and WHICH YEAR it is
 * showing — which is not the same as the selected year. Paging to 2025 to look
 * around and then closing without choosing has to leave the selection alone.
 */
export function useMonthPicker(period: string, onChange: (period: string) => void) {
  const range = useMonthRange()
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => yearOf(period))
  const containerRef = useRef<HTMLDivElement>(null)

  // Reopening always lands on the selected month's year, so the panel never
  // opens somewhere the owner did not leave it.
  useEffect(() => {
    if (open) setYear(yearOf(period))
  }, [open, period])

  // A click anywhere else, or Escape, closes it — the two things anyone tries
  // first to dismiss a popover.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const previous = shiftPeriod(period, -1)
  const next = shiftPeriod(period, 1)

  return {
    containerRef,
    open,
    toggle: () => setOpen((current) => !current),
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
