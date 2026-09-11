import type { ReactNode } from 'react'
import Link from 'next/link'
import { CaretLeftIcon } from '@/data/icons'

interface ScreenHeaderProps {
  title: string
  /** The screen's one affordance, at the far right of the title line — almost
   * always "add another one of these". */
  action?: ReactNode
  /** The quiet line under the title: what the screen adds up to. */
  subtitle?: ReactNode
  /** Where a back caret goes. Only the screens reached THROUGH the menu have
   * one; a tab is never something you came from. */
  backHref?: string
  /** Anything that belongs to the header but is not the title line — the month
   * pill, a row of filter chips, a progress bar. */
  children?: ReactNode
  /** Closes the header with a rule. For a screen whose body is a bare list,
   * which would otherwise start with no edge to hang from. */
  bordered?: boolean
}

/**
 * The top of every screen. It lives in the PAGE and not in a layout because the
 * pieces differ per screen — one carries a month pill, another a set of filter
 * chips, another a progress bar — and a single global bar could only ever hold
 * the title, which is the one part that was never the problem.
 */
export function ScreenHeader({
  title,
  action,
  subtitle,
  backHref,
  children,
  bordered = false,
}: ScreenHeaderProps) {
  return (
    /* Pinned: the design has the header sit still while the body scrolls
       under it, and on the web the whole screen is one scroll container — so
       `sticky` is what buys that without every page having to split itself into
       a fixed part and a scrolling part. The opaque background is not optional,
       or the rows would show through it. */
    <header
      className={`sticky top-0 z-30 bg-ink-bg px-5 pb-3 pt-6 ${
        bordered ? 'border-b border-ink-border' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} aria-label="Voltar" className="text-neutral-500 hover:text-ink-text">
            <CaretLeftIcon size={19} />
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-[19px] font-medium tracking-[-0.01em]">
          {title}
        </h1>
        {action}
      </div>

      {subtitle && <p className="mt-1.5 text-[11.5px] text-neutral-600">{subtitle}</p>}
      {children}
    </header>
  )
}
