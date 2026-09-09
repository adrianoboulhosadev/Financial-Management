import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/**
 * The `<select>` twin of `Field`: same label, same box, same error line, so a
 * form mixing typed and chosen values reads as one thing. It carries no options
 * of its own — whoever calls it knows what there is to choose.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className = '', children, ...props },
  ref,
) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </span>
      <select
        ref={ref}
        className={`w-full rounded-lg border border-ink-border bg-ink-bg px-3 py-2.5 text-ink-text outline-none transition-colors focus:border-accent disabled:opacity-60 ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="block text-xs text-ink-text-muted">{hint}</span>}
      {error && <span className="block text-sm text-negative">{error}</span>}
    </label>
  )
})
