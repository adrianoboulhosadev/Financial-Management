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
 *
 * The figures are TABULAR, set in the same Inter as the rest of the interface.
 * On React Native that is `fontVariant` and not a class: NativeWind has no
 * `tabular-nums` utility to compile, and dropping to a monospaced family
 * instead — which is what this used to do — would make a column of money read
 * as a different voice from the label beside it.
 */
export function Amount({ cents, tone = 'neutral', signed = false, className = '' }: AmountProps) {
  const resolved = tone === 'movement' ? (cents < 0 ? 'expense' : 'income') : tone
  const prefix = signed ? (resolved === 'expense' ? '−' : '+') : ''

  return (
    <Text
      style={{ fontVariant: ['tabular-nums'] }}
      className={`${TONE_CLASSES[resolved]} ${className}`}
    >
      {prefix}
      {formatBRL(Math.abs(cents))}
    </Text>
  )
}
