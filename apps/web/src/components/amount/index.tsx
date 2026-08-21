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
 * Every amount on screen goes through here: tabular figures so columns line up,
 * and the colour decided in ONE place rather than re-derived at each call site.
 */
export function Amount({ cents, tone = 'neutral', signed = false, className = '' }: AmountProps) {
  const resolved = tone === 'movement' ? (cents < 0 ? 'expense' : 'income') : tone
  const prefix = signed ? (resolved === 'expense' ? '−' : '+') : ''

  return (
    <span className={`font-mono tabular-nums ${TONE_CLASSES[resolved]} ${className}`}>
      {prefix}
      {formatBRL(Math.abs(cents))}
    </span>
  )
}
