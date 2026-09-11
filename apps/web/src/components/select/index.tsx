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
    <label className="block">
      <span className="mb-[7px] block text-[9.5px] uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </span>
      <select
        ref={ref}
        className={`w-full rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3 text-[13.5px] text-ink-text outline-none transition-colors focus:border-accent-800 disabled:opacity-60 ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="mt-1.5 block text-[10.5px] text-neutral-600">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-negative">{error}</span>}
    </label>
  )
})
