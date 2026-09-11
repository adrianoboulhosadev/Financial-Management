import type { ReactNode } from 'react'

interface ListRowProps {
  children: ReactNode
  /** The LAST row of a group drops its rule: a divider under the final item
   * draws a line against nothing. */
  last?: boolean
  /** A row whose content is taller than one line (an inbox entry) aligns its
   * icon and its actions to the TOP instead of centring them against a
   * paragraph. */
  alignTop?: boolean
  className?: string
}

/**
 * One line of a list: icon, what it is, what it cost. The hairline underneath is
 * the row's own, which is what lets a list live directly on the background or
 * inside a pane without either needing to know about the other.
 */
export function ListRow({ children, last = false, alignTop = false, className = '' }: ListRowProps) {
  return (
    <div
      className={`flex gap-3 py-3.5 ${alignTop ? 'items-start' : 'items-center'} ${
        last ? '' : 'border-b border-ink-border'
      } ${className}`}
    >
      {children}
    </div>
  )
}
