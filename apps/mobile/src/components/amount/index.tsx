import { Text } from 'react-native'
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
 * Every amount on screen goes through here — the same rule and the same tone
 * table as the web's <Amount>, so a value is coloured identically on both.
 */
export function Amount({ cents, tone = 'neutral', signed = false, className = '' }: AmountProps) {
  const resolved = tone === 'movement' ? (cents < 0 ? 'expense' : 'income') : tone
  const prefix = signed ? (resolved === 'expense' ? '−' : '+') : ''

  return (
    <Text className={`font-mono ${TONE_CLASSES[resolved]} ${className}`}>
      {prefix}
      {formatBRL(Math.abs(cents))}
    </Text>
  )
}
