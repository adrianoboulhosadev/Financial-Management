import { formatBRL, TONE_CLASSES, type AmountTone } from 'ui'

interface AmountProps {
  // INTEGER CENTS, as everything else in the product.
  cents: number
  tone?: AmountTone
  /** Prefixes an explicit +/− so a listing reads without hunting for the colour. */
  signed?: boolean
  className?: string
}

/**
 * Every amount on screen goes through here: TABULAR figures so columns line up,
 * and the colour decided in ONE place rather than re-derived at each call site.
 *
 * Tabular figures, not a monospace family. The digits were the only part that
 * had to be fixed-width, and `tabular-nums` is exactly that feature of the type
 * the rest of the interface is already set in — so a row of money reads as the
 * same voice as the label beside it instead of a quotation from a terminal.
 */
export function Amount({ cents, tone = 'neutral', signed = false, className = '' }: AmountProps) {
  const resolved = tone === 'movement' ? (cents < 0 ? 'expense' : 'income') : tone
  const prefix = signed ? (resolved === 'expense' ? '−' : '+') : ''

  return (
    <span className={`tabular-nums ${TONE_CLASSES[resolved]} ${className}`}>
      {prefix}
      {formatBRL(Math.abs(cents))}
    </span>
  )
}
