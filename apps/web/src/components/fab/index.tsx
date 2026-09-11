import type { ButtonHTMLAttributes } from 'react'
import { PlusIcon } from '@/data/icons'

/**
 * The compose button. It floats over the list rather than sitting in the
 * header because it is the thing the screen is FOR — recording something — and
 * the bottom-right corner is where a thumb already is.
 *
 * It is the one filled control in the product (see the button variants): with
 * nothing around it to be outlined against, an outline would leave it looking
 * like a hole in the list.
 */
export function Fab({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`fixed bottom-24 right-5 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-accent text-ink-bg shadow-card transition-colors hover:bg-accent-500 ${className}`}
      {...props}
    >
      <PlusIcon size={24} />
    </button>
  )
}
