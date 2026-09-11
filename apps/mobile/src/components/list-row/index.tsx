import type { ReactNode } from 'react'
import { View } from 'react-native'

interface ListRowProps {
  children: ReactNode
  /** The LAST row of a group drops its rule: a divider under the final item
   * draws a line against nothing. */
  last?: boolean
  /** A row whose content is taller than one line aligns its icon and actions to
   * the TOP instead of centring them against a paragraph. */
  alignTop?: boolean
  className?: string
}

/** One line of a list — the same 3.5 padding and hairline the web's `<ListRow>`
 * draws, so a list reads identically on both. */
export function ListRow({ children, last = false, alignTop = false, className = '' }: ListRowProps) {
  return (
    <View
      className={`flex-row gap-3 py-3.5 ${alignTop ? 'items-start' : 'items-center'} ${
        last ? '' : 'border-b border-ink-border'
      } ${className}`}
    >
      {children}
    </View>
  )
}
