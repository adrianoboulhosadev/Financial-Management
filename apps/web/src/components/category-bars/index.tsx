import { Amount } from '@/components/amount'

export interface CategoryBar {
  id: string
  label: string
  cents: number
}

interface CategoryBarsProps {
  bars: CategoryBar[]
  /** What 100% of the track means. Passed in rather than summed here: the
   * dashboard's whole is the month's total spending, and a list showing only
   * the top few must not rescale itself to its own visible rows. */
  totalCents: number
}

/**
 * Ranked horizontal bars — the form for "compare magnitude", and the reason it
 * beats a pie here is that the labels are long ("casa / contas / luz") and the
 * values are often close.
 *
 * ONE hue for every bar, deliberately: length already encodes the magnitude, so
 * a colour ramp on top of it would spend the only free channel restating what
 * the bar is already saying — and this product keeps its saturated colours for
 * things that MEAN something (in, out, over a ceiling).
 *
 * The value rides the tip of each row rather than being repeated on an axis:
 * with a handful of rows, direct labels make the axis unnecessary.
 */
export function CategoryBars({ bars, totalCents }: CategoryBarsProps) {
  return (
    <ul className="space-y-2.5">
      {bars.map((bar) => (
        <li key={bar.id} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink-text-soft">{bar.label}</span>
            <Amount cents={bar.cents} />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-surface-soft">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{
                width: `${totalCents === 0 ? 0 : Math.round((bar.cents / totalCents) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
