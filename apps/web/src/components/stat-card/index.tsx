import type { ReactNode } from 'react'
import { ACCENT_CLASSES, type StatCardAccent } from './data/accents'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  accent?: StatCardAccent
}

export function StatCard({ label, value, hint, accent = 'none' }: StatCardProps) {
  return (
    <div
      className={`rounded-card border border-ink-border border-l-4 bg-ink-surface p-4 shadow-card ${ACCENT_CLASSES[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-text-muted">{hint}</p>}
    </div>
  )
}
