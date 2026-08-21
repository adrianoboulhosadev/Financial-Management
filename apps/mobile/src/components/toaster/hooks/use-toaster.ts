import { useEffect, useState } from 'react'
import { onToast, type Toast } from '../toast-bus'

/** How long a message stays up. Long enough to read a sentence, short enough
 * not to sit on top of the content the user came back to. */
const VISIBLE_MS = 3500

export function useToaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(
    () =>
      onToast((toast) => {
        setToasts((current) => [...current, toast])
        setTimeout(
          () => setToasts((current) => current.filter((item) => item.id !== toast.id)),
          VISIBLE_MS,
        )
      }),
    [],
  )

  return { toasts }
}
