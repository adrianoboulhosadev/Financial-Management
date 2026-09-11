'use client'

import { formatPeriodShort, shiftPeriod, toPeriod } from 'ui'
import { CaretLeftIcon, CaretRightIcon } from '@/data/icons'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/**
 * Walks the reports one month at a time. Kept deliberately dumb (no state of
 * its own): whoever owns the screen owns the period, because several queries
 * key off it.
 *
 * A full-width pill with the month centred between two carets, which is what
 * makes it read as the screen's context rather than as one more control — the
 * month is what everything below it is about.
 */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const current = toPeriod()
  const atCurrent = period >= current

  return (
    <div className="mt-3 flex items-center justify-between rounded-full bg-ink-surface px-3.5 py-2">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftPeriod(period, -1))}
        className="text-neutral-500 transition-colors hover:text-ink-text"
      >
        <CaretLeftIcon size={14} />
      </button>

      <span className="text-[13px] font-medium capitalize">{formatPeriodShort(period)}</span>

      <button
        type="button"
        aria-label="Próximo mês"
        // Stops at the current month: there is nothing recorded in the future,
        // so walking forward would only ever show an empty screen. Disabled it
        // greys to the card outline rather than disappearing, so the pill stays
        // symmetrical and the control stays findable.
        disabled={atCurrent}
        onClick={() => onChange(shiftPeriod(period, 1))}
        className={
          atCurrent ? 'text-ink-border-strong' : 'text-neutral-500 transition-colors hover:text-ink-text'
        }
      >
        <CaretRightIcon size={14} />
      </button>
    </div>
  )
}
