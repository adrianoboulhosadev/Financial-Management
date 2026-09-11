import type { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

/** A filter pill. The selected one fills with the accent's darkest tint rather
 * than inverting, so a row of chips stays a row of chips instead of one button
 * shouting next to three labels. */
export function Chip({ active = false, className = '', type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
        active
          ? 'border-accent-900 bg-accent-900 text-accent-200'
          : 'border-ink-border-strong text-neutral-500 hover:text-neutral-300'
      } ${className}`}
      {...props}
    />
  )
}
