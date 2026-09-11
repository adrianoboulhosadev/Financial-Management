'use client'

import { useEffect, useState } from 'react'
import { DESKTOP_CUTOFF } from 'ui'

/**
 * Whether the window is narrow enough for the app to be the app.
 *
 * It starts as `null` — "not measured yet" — rather than as a guess. The server
 * has no width to render against, so committing to either answer would paint
 * one layout on the server and the other on the client, and React would flag
 * the mismatch on every load. `null` renders nothing for the one frame before
 * the effect runs, which is a frame nobody sees.
 *
 * `matchMedia` and not a resize listener: the browser already knows when a
 * threshold is crossed, and it fires once per crossing instead of once per
 * pixel of a drag.
 */
export function useViewportFits(): boolean | null {
  const [fits, setFits] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${DESKTOP_CUTOFF - 1}px)`)
    const sync = () => setFits(query.matches)

    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return fits
}
