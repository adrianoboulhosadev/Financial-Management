'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * The single place feedback is shown. Mounted once in the root layout;
 * anywhere else, just call `notify` (see lib/notify).
 *
 * `default` is applied to EVERY toast, not just untyped ones, so its neutral
 * palette competes with the per-type one below — Tailwind settles conflicting
 * utilities by their order in the compiled CSS (not by class order), which
 * made the winner arbitrary. The `!` modifier makes the per-type colour win.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group flex w-full items-center gap-3 rounded-card border p-4 text-sm shadow-card backdrop-blur',
          default: 'border-ink-border bg-ink-surface text-ink-text',
          success: '!border-positive/50 !bg-ink-surface !text-positive',
          error: '!border-negative/50 !bg-ink-surface !text-negative',
          info: '!border-accent/50 !bg-ink-surface !text-accent',
          warning: '!border-warning/50 !bg-ink-surface !text-warning',
          description: 'text-ink-text-soft',
          closeButton: 'border-ink-border bg-ink-surface text-ink-text-muted hover:text-ink-text',
        },
      }}
    />
  )
}
