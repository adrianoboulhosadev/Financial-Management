import type { ReactNode } from 'react'
import { View } from 'react-native'

interface PaneProps {
  children: ReactNode
  className?: string
}

/** The card every screen is built from — the same surface, outline and radius
 * as the web's `<Pane>`, because they are the same product. It carries no
 * padding of its own: a hero figure and a list of rows want different ones. */
export function Pane({ children, className = '' }: PaneProps) {
  return (
    <View className={`rounded-card border border-ink-border-strong bg-ink-surface ${className}`}>
      {children}
    </View>
  )
}
