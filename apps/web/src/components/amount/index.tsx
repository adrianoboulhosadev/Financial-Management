import { formatBRL } from '@/lib/money'

interface AmountProps {
  // INTEGER CENTS, as everything else in the product.
  cents: number
  /**
   * How to colour it. `movement` reads the sign of the number itself (a
   * leftover, a remaining budget); `expense`/`income` state the direction
   * explicitly, because a recorded amount is always a positive magnitude and
   * only its type says which way it went.
   */
  tone?: 'movement' | 'expense' | 'income' | 'neutral'
  /** Prefixes an explicit +/− so a listing reads without hunting for the colour. */
  signed?: boolean
  className?: string
}

const TONE_CLASSES: Record<string, string> = {
  income: 'text-positive',
  expense: 'text-negative',
  neutral: 'text-ink-text',
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
