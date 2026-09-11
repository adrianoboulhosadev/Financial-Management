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
    <div className="rounded-card border border-dashed border-ink-border-strong px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-ink-text">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-[260px] text-[11.5px] leading-relaxed text-neutral-600">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
