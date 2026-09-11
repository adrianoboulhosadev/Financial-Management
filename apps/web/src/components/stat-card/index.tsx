import type { ReactNode } from 'react'
import { Kicker } from '@/components/kicker'
import { Pane } from '@/components/pane'
import { STAT_CARD_TONES, type StatCardAccent } from './data/accents'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: StatCardAccent
  /** The glyph that says which direction the figure is — in, out, or neither. */
  icon?: ReactNode
}

/**
 * A single figure with its name above and its caveat below. The colour is
 * carried by the NUMBER and by the little icon beside the label, not by a band
 * around the card: two of these sit side by side on the dashboard, and painting
 * their edges would turn a pair of readings into a pair of alerts.
 */
export function StatCard({ label, value, hint, accent = 'none', icon }: StatCardProps) {
  return (
    <Pane className="flex-1 px-3.5 pb-4 pt-3.5">
      <div className="flex items-center gap-1.5">
        {icon && <span className={STAT_CARD_TONES[accent]}>{icon}</span>}
        <Kicker>{label}</Kicker>
      </div>
      <p className={`mt-2 text-lg font-medium tabular-nums ${STAT_CARD_TONES[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-[10.5px] leading-snug text-neutral-600">{hint}</p>}
    </Pane>
  )
}
