export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ink-bg hover:bg-accent/90',
  secondary:
    'border border-ink-border bg-ink-surface-soft text-ink-text hover:border-ink-border-strong',
  danger: 'border border-negative/50 text-negative hover:bg-negative/10',
  ghost: 'text-ink-text-soft hover:bg-ink-surface-soft hover:text-ink-text',
}
