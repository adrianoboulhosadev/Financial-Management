export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'solid'

/**
 * Same variants, same token names and the same OUTLINED primary as the web's
 * button — the classes differ only where the web adds behaviour a touch screen
 * does not have (hover, focus-visible).
 *
 * `solid` exists for the one control with no container to be outlined against:
 * the floating compose button.
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-accent',
  secondary: 'border border-ink-border-strong',
  danger: 'border border-negative/50',
  ghost: '',
  solid: 'bg-accent',
}

export const BUTTON_LABEL_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-accent-200',
  secondary: 'text-neutral-400',
  danger: 'text-negative',
  ghost: 'text-neutral-500',
  solid: 'text-ink-bg',
}
