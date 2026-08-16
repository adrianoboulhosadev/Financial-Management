import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { sanitizeMoneyInput } from '@/lib/money'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  // A reais amount field: renders as text (never a native `type="number"`, so
  // there is no scientific notation, no spinner arrows and no scroll-to-change
  // wheel hijack) and strips anything that isn't a digit or a single decimal
  // separator as the user types. Pair with lib/money's toCents on submit.
  money?: boolean
}

// Labeled input with an optional error message. forwardRef so react-hook-form's
// `register` (which passes a ref) works transparently.
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, money = false, className = '', type, inputMode, onChange, ...props },
  ref,
) {
  const handleChange = money
    ? (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = sanitizeMoneyInput(event.target.value)
        onChange?.(event)
      }
    : onChange

  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </span>
      <input
        ref={ref}
        type={money ? 'text' : type}
        inputMode={money ? 'decimal' : inputMode}
        onChange={handleChange}
        className={`w-full rounded-lg border border-ink-border bg-ink-bg px-3 py-2.5 text-ink-text outline-none transition-colors placeholder:text-ink-text-muted focus:border-accent ${
          money ? 'font-mono tabular-nums' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-sm text-negative">{error}</span>}
    </label>
  )
})
