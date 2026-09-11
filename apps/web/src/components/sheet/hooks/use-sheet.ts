'use client'

import { useEffect, useState } from 'react'

/**
 * Mount flag plus the two things every sheet owes the person using it: Escape
 * closes it, and the page behind it does not scroll while it is open.
 *
 * The mount flag exists because the sheet renders through a portal into
 * `document.body`, which does not exist while Next is prerendering on the
 * server.
 */
export function useSheet(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return { mounted }
}
