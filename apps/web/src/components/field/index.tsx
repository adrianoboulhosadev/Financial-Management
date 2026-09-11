import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { sanitizeMoneyInput } from 'ui'

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
    <label className="block">
      <span className="mb-[7px] block text-[9.5px] uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </span>
      <input
        ref={ref}
        type={money ? 'text' : type}
        inputMode={money ? 'decimal' : inputMode}
        onChange={handleChange}
        className={`w-full rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3 text-[13.5px] text-ink-text outline-none transition-colors placeholder:text-neutral-700 focus:border-accent-800 ${
          money ? 'tabular-nums' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs text-negative">{error}</span>}
    </label>
  )
})
