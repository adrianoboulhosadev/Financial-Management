import type { InputHTMLAttributes } from 'react'
import { CheckIcon } from '@/data/icons'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Omit it for a bare tick — the checklist's rows, where the row's own text
   * IS the label. Pass `aria-label` there instead. */
  label?: string
  /** The line under the label. Worth having here rather than in each caller:
   * every box in this product is a rule the owner is choosing, and a rule needs
   * a sentence. */
  hint?: string
}

/**
 * The box is DRAWN rather than left native, because the native one cannot be
 * given this radius or this checked colour on every browser — but the input is
 * still a real `<input type="checkbox">` underneath, visually hidden. That is
 * what keeps the keyboard, the label association and the screen reader intact;
 * a `<div>` with an onClick would have thrown all three away for a rounded
 * corner.
 */
export function Checkbox({ label, hint, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="mt-px flex h-[19px] w-[19px] flex-none items-center justify-center rounded-[5px] border-[1.5px] border-neutral-700 text-transparent transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-ink-bg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
        <CheckIcon size={12} />
      </span>
      {label && (
        <span className="min-w-0">
          <span className="block text-[13px] text-ink-text">{label}</span>
          {hint && <span className="mt-0.5 block text-[11px] text-neutral-600">{hint}</span>}
        </span>
      )}
    </label>
  )
}
