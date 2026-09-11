import { formatBRL, INK, PIE_VIEWBOX, wedgePath } from 'ui'
import { MONTH_SLICES, type MonthSliceKey } from './data/slices'

interface MonthPieProps {
  /** Everything that came in — the whole the pie divides. */
  incomeCents: number
  /** The month's fixed bills (paid or still owed). */
  fixedCents: number
  /** Everything else that was spent. */
  variableCents: number
}

/**
 * The month as one circle: where the income went. Part-to-whole across THREE
 * shares, each carrying its own label, value and percentage in the legend
 * beside it — so nothing here is read by colour alone and the figures can be
 * compared as figures rather than estimated from wedge angles.
 *
 * The wedges are separated by a stroke in the SURFACE colour rather than by a
 * gap: it keeps neighbouring shares distinct without drawing a line that is not
 * data, and it stays correct when one share shrinks to a sliver.
 *
 * A month in the red has nothing left to show as "sobra": the leftover wedge
 * disappears and the two spending shares fill the circle, which is the honest
 * picture.
 */
export function MonthPie({ incomeCents, fixedCents, variableCents }: MonthPieProps) {
  const leftoverCents = incomeCents - fixedCents - variableCents
  const values: Record<MonthSliceKey, number> = {
    fixed: fixedCents,
    variable: variableCents,
    leftover: Math.max(leftoverCents, 0),
  }
  // Overspending is divided against what was actually spent, so the circle
  // stays a circle instead of a share overflowing it.
  const total = Math.max(incomeCents, fixedCents + variableCents)

  if (total === 0) {
    return (
      <p className="text-[11.5px] text-neutral-600">
        Cadastre sua renda para ver como o mês se divide.
      </p>
    )
  }

  let cursor = 0
  const wedges = MONTH_SLICES.filter((slice) => values[slice.key] > 0).map((slice) => {
    const size = values[slice.key] / total
    const d = wedgePath(cursor, size)
    cursor += size
    return { ...slice, d }
  })

  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox={`0 0 ${PIE_VIEWBOX} ${PIE_VIEWBOX}`}
        width={140}
        height={140}
        className="flex-none"
        aria-hidden
      >
        {wedges.map((wedge) => (
          <path key={wedge.key} d={wedge.d} fill={wedge.fill} stroke={INK.surface} strokeWidth={2} />
        ))}
      </svg>

      <ul className="flex flex-1 flex-col gap-3.5">
        {MONTH_SLICES.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2.5">
            <span className={`h-2 w-2 flex-none rounded-sm ${slice.swatch}`} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] text-neutral-500">{slice.label}</span>
              <span className="mt-0.5 block text-[13.5px] tabular-nums">
                {/* The leftover keeps its SIGN here: a month in the red shows a
                    negative sobra rather than a zero it does not have. */}
                {formatBRL(slice.key === 'leftover' ? leftoverCents : values[slice.key])}
              </span>
            </span>
            <span className="text-[11px] tabular-nums text-neutral-600">
              {Math.round((values[slice.key] / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
