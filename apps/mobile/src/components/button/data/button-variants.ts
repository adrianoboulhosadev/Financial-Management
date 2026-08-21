export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

/**
 * Same variants and same token names as the web's button. The classes differ
 * only where the web adds behaviour a touch screen does not have (hover,
 * focus-visible) — the COLOURS come from the shared preset, so the two buttons
 * are the same button.
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'border border-ink-border bg-ink-surface-soft',
  danger: 'border border-negative/50',
  ghost: '',
}

export const BUTTON_LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-ink-bg',
  secondary: 'text-ink-text',
  danger: 'text-negative',
  ghost: 'text-ink-text-soft',
}
