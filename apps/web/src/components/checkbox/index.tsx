import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  /** The line under the label. Worth having here rather than in each caller:
   * every box in this product is a rule the owner is choosing, and a rule needs
   * a sentence. */
  hint?: string
}

/** A labelled checkbox in the form's own box style. `accent-accent` paints the
 * native control with the product's action colour, which keeps it a real
 * checkbox — keyboard, screen readers and all — instead of a div pretending. */
export function Checkbox({ label, hint, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm text-ink-text">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-text-muted">{hint}</span>}
      </span>
    </label>
  )
}
