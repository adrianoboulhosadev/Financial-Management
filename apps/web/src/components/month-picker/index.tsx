'use client'

import { formatPeriodShort, monthsOfYear } from 'ui'
import { CaretLeftIcon, CaretRightIcon } from '@/data/icons'
import { useMonthPicker } from './hooks/use-month-picker'

interface MonthPickerProps {
  // "YYYY-MM" — the same shape the API's MonthPeriod speaks.
  period: string
  onChange: (period: string) => void
}

/**
 * Walks the reports one month at a time, or jumps straight to one. Kept
 * deliberately dumb about the DATA (no state but its own panel): whoever owns
 * the screen owns the period, because several queries key off it.
 *
 * The pill is a button, not just a label. Stepping with the arrows is right for
 * "last month"; getting to a month a year back that way is eleven taps, which
 * is why the label opens a year-and-month grid instead of being decoration.
 *
 * Both ways are bounded by the account's own window (see `useMonthRange`) —
 * there is nothing recorded before the account existed or after today, so those
 * months are not offered rather than offered and empty.
 */
export function MonthPicker({ period, onChange }: MonthPickerProps) {
  const picker = useMonthPicker(period, onChange)

  return (
    <div ref={picker.containerRef} className="relative mt-3">
      <div className="flex items-center justify-between rounded-full bg-ink-surface px-3.5 py-2">
        <button
          type="button"
          aria-label="Mês anterior"
          disabled={!picker.canGoBack}
          onClick={picker.goBack}
          className={
            picker.canGoBack
              ? 'text-neutral-500 transition-colors hover:text-ink-text'
              : 'text-ink-border-strong'
          }
        >
          <CaretLeftIcon size={14} />
        </button>

        <button
          type="button"
          onClick={picker.toggle}
          aria-expanded={picker.open}
          aria-haspopup="dialog"
          className="text-[13px] font-medium capitalize transition-colors hover:text-accent-200"
        >
          {formatPeriodShort(period)}
        </button>

        <button
          type="button"
          aria-label="Próximo mês"
          // Stops at the current month: there is nothing recorded in the future,
          // so walking forward would only ever show an empty screen. Disabled it
          // greys to the card outline rather than disappearing, so the pill stays
          // symmetrical and the control stays findable.
          disabled={!picker.canGoForward}
          onClick={picker.goForward}
          className={
            picker.canGoForward
              ? 'text-neutral-500 transition-colors hover:text-ink-text'
              : 'text-ink-border-strong'
          }
        >
          <CaretRightIcon size={14} />
        </button>
      </div>

      {picker.open && (
        <div
          role="dialog"
          aria-label="Escolher mês"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 animate-fadeIn rounded-card border border-ink-border-strong bg-ink-surface p-3 shadow-card"
        >
          <div className="flex items-center justify-between px-1 pb-2.5">
            <button
              type="button"
              aria-label="Ano anterior"
              disabled={!picker.canPreviousYear}
              onClick={picker.previousYear}
              className={
                picker.canPreviousYear
                  ? 'text-neutral-500 transition-colors hover:text-ink-text'
                  : 'text-ink-border-strong'
              }
            >
              <CaretLeftIcon size={14} />
            </button>

            <span className="text-[13px] font-medium tabular-nums">{picker.year}</span>

            <button
              type="button"
              aria-label="Próximo ano"
              disabled={!picker.canNextYear}
              onClick={picker.nextYear}
              className={
                picker.canNextYear
                  ? 'text-neutral-500 transition-colors hover:text-ink-text'
                  : 'text-ink-border-strong'
              }
            >
              <CaretRightIcon size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {monthsOfYear(picker.year).map((option) => {
              const selected = option.period === period
              const selectable = picker.isSelectable(option.period)

              return (
                <button
                  key={option.period}
                  type="button"
                  disabled={!selectable}
                  onClick={() => picker.select(option.period)}
                  aria-current={selected ? 'true' : undefined}
                  className={`rounded-field py-2 text-[12px] capitalize transition-colors ${
                    selected
                      ? 'bg-accent-900 text-accent-200'
                      : selectable
                        ? 'text-neutral-400 hover:bg-ink-surface-soft hover:text-ink-text'
                        : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
