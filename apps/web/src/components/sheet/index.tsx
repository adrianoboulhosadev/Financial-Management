'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/data/icons'
import { useSheet } from './hooks/use-sheet'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A long form arrives from the BOTTOM rather than as a panel beside the list,
 * because at this width there is no beside. It stops short of the top so the
 * screen it came from stays visible behind it — which is what says "you are
 * still on the lançamentos screen, filling something in" instead of "you have
 * navigated somewhere else".
 *
 * Portalled into `<body>`: as a child of the page it would inherit the scroll
 * container's clipping and the fixed backdrop would stop covering the screen.
 */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  const { mounted } = useSheet(open, onClose)

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex flex-col justify-end bg-ink-bg/70" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88dvh] animate-slideUp flex-col rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface"
      >
        <header className="flex flex-none items-center gap-3 border-b border-ink-border px-5 py-4">
          <h2 className="flex-1 text-[15px] font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-500 transition-colors hover:text-ink-text"
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
