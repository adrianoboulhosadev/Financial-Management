'use client'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../button'
import { useConfirmDialog } from './hooks/use-confirm-dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
  confirmDisabled?: boolean
}

/** Blocking confirmation for a destructive action (deleting a category, a
 * movement, an income source) — those must never fire on a single click. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const { mounted } = useConfirmDialog(open, onCancel)

  if (!open || !mounted) return null

  // Rendered into <body>, NOT where it is declared: as a child of the page the
  // overlay inherits the parent's layout — a `space-y-*` container, for one,
  // pushes a margin onto it and the full-screen backdrop stops covering the top
  // of the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-[95] grid place-items-center bg-ink-bg/80 px-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm space-y-4 rounded-card border border-ink-border bg-ink-surface p-6 shadow-card"
      >
        <h2 className="text-base font-semibold text-ink-text">{title}</h2>
        {description && <p className="text-sm text-ink-text-soft">{description}</p>}

        {children}

        {/* flex-wrap is required, not decorative: the buttons are
            whitespace-nowrap, so a long confirm label makes the pair wider than
            the dialog's max-w-sm and Cancel spills out of the box. */}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" autoFocus onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
