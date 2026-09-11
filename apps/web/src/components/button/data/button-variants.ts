export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'solid'

export const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-field px-4 py-3 text-[13.5px] transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/**
 * The product's buttons are OUTLINED, including the primary one. On a surface
 * this dark a filled block of accent reads as a coloured panel rather than a
 * control, and the screens routinely put two actions side by side ("aportar
 * tudo" / "escolher valor") where one filled and one outlined would rank them
 * apart when they are equals.
 *
 * `solid` is the exception and exists for exactly one thing: the floating
 * compose button, which has no container to be outlined against.
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-accent bg-transparent text-accent-200 hover:bg-accent-900',
  secondary: 'border border-ink-border-strong text-neutral-400 hover:text-ink-text',
  danger: 'border border-negative/50 text-negative hover:bg-negative/10',
  ghost: 'text-neutral-500 hover:text-ink-text',
  solid: 'bg-accent text-ink-bg hover:bg-accent-500',
}
