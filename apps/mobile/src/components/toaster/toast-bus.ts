export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error'
}

type Listener = (toast: Toast) => void

const listeners = new Set<Listener>()
let nextId = 0

/**
 * A module-level bus, not a context, and deliberately: the `Notifier` port is
 * called from inside shared hooks that know nothing about React trees, so the
 * feedback has to be raisable from plain code. The <Toaster /> subscribes and
 * is the only thing that renders.
 */
export function showToast(toast: Omit<Toast, 'id'>): void {
  const full = { ...toast, id: ++nextId }
  listeners.forEach((listener) => listener(full))
}

export function onToast(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
