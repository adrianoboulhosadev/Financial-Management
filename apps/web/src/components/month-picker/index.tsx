'use client'

import { formatPeriod, shiftPeriod, toPeriod } from '@/lib/date'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/**
 * Walks the reports one month at a time. Kept deliberately dumb (no state of
 * its own): whoever owns the screen owns the period, because several queries
 * key off it.
 */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const current = toPeriod()

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-ink-border bg-ink-surface p-1">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftPeriod(period, -1))}
        className="rounded px-2.5 py-1 text-ink-text-soft transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
      >
        ‹
      </button>
      <span className="min-w-[9.5rem] text-center text-sm font-medium capitalize">
        {formatPeriod(period)}
      </span>
      <button
        type="button"
        aria-label="Próximo mês"
        // Stops at the current month: there is nothing recorded in the future,
        // so walking forward would only ever show an empty screen.
        disabled={period >= current}
        onClick={() => onChange(shiftPeriod(period, 1))}
        className="rounded px-2.5 py-1 text-ink-text-soft transition-colors hover:bg-ink-surface-soft hover:text-ink-text disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </div>
  )
}
