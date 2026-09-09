import { formatBRL } from 'ui'
import { MONTH_SPLIT_SEGMENTS, MONTH_SPLIT_SWATCHES } from './data/segments'

interface MonthSplitBarProps {
  /** Everything that came in — the whole the bar divides. */
  incomeCents: number
  /** The month's fixed bills (paid or still owed). */
  fixedCents: number
  /** Everything else that was spent. */
  variableCents: number
}

/**
 * The month in one bar: where the income went. Part-to-whole with THREE
 * segments — the one form a stacked bar is unambiguously right for — and each
 * segment carries its own label and value, so nothing is read by colour alone.
 *
 * Plain divs rather than SVG: three rectangles in a row is what flexbox already
 * is, and a `<svg>` here would only add coordinates to maintain. The 2px gaps
 * are the surface doing the separating, so neighbouring blocks stay distinct
 * without a border drawing ink that is not data.
 *
 * A month in the red has nothing left to show as "sobra": the leftover segment
 * simply disappears and the two spending blocks fill the bar, which is the
 * honest picture.
 */
export function MonthSplitBar({ incomeCents, fixedCents, variableCents }: MonthSplitBarProps) {
  const leftoverCents = incomeCents - fixedCents - variableCents
  const values = {
    fixed: fixedCents,
    variable: variableCents,
    leftover: Math.max(leftoverCents, 0),
  }
  // Overspending is divided against what was actually spent, so the bar stays
  // full instead of overflowing its own track.
  const total = Math.max(incomeCents, fixedCents + variableCents)
  const shown = MONTH_SPLIT_SEGMENTS.filter((segment) => values[segment.key] > 0)

  if (total === 0) {
    return (
      <p className="text-sm text-ink-text-soft">
        Cadastre sua renda para ver como o mês se divide.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-ink-surface-soft">
        {shown.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: `${(values[segment.key] / total) * 100}%` }}
            title={`${segment.label}: ${formatBRL(values[segment.key])}`}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
        {MONTH_SPLIT_SEGMENTS.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${MONTH_SPLIT_SWATCHES[segment.key]}`}
            />
            <span className="text-ink-text-soft">{segment.label}</span>
            <span className="font-mono tabular-nums text-ink-text-muted">
              {formatBRL(segment.key === 'leftover' ? leftoverCents : values[segment.key])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
