import type { ReactNode } from 'react'

interface PaneProps {
  children: ReactNode
  className?: string
}

/**
 * The card every screen is built from: a surface block, outlined one step
 * louder than a row divider so it reads as a single object rather than a patch
 * of background.
 *
 * It carries no padding of its own. A pane holding a hero figure breathes at
 * 18px and a pane wrapping a list of rows has to sit at 16px horizontally with
 * the rows supplying the vertical rhythm — baking one in would mean every
 * second caller overriding it.
 */
export function Pane({ children, className = '' }: PaneProps) {
  return (
    <div className={`rounded-card border border-ink-border-strong bg-ink-surface ${className}`}>
      {children}
    </div>
  )
}
