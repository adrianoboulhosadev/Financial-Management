import type { ReactNode } from 'react'

interface KickerProps {
  children: ReactNode
  className?: string
}

/**
 * The small capitalised line that names a block — "sobra do mês", "em aberto",
 * "renda fixa". Wide letter-spacing at a size well under the body text, which
 * is what lets it label a figure without competing with it.
 *
 * A `<p>` and not a heading: these caption the block beside them, and promoting
 * every one of them to an `<h2>` would hand a screen reader an outline made of
 * captions.
 */
export function Kicker({ children, className = '' }: KickerProps) {
  return (
    <p className={`text-[9.5px] uppercase tracking-[0.16em] text-neutral-600 ${className}`}>
      {children}
    </p>
  )
}
