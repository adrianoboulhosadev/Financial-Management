import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** What a list shows before it has anything in it — always says what to do
 * next, never just "sem dados". */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-ink-border bg-ink-surface/40 px-6 py-10 text-center">
      <p className="font-medium text-ink-text">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-text-soft">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
