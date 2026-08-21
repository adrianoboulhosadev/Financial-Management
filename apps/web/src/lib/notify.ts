import { toast } from 'sonner'
import { errorMessage, type Notifier } from 'ui'

/**
 * The web's adapter of the `Notifier` port: sonner. The shared hooks announce
 * through the port, so the same mutation renders a sonner toast here and a
 * native toast on the phone without either knowing about the other.
 */
export const notifier: Notifier = {
  success(message) {
    toast.success(message)
  },
  error(message) {
    toast.error(message)
  },
}

/**
 * What the screens call directly (a toast tied to the action that raised it,
 * expiring on its own, so a stale message can never linger after a later action
 * succeeded).
 */
export const notify = {
  success: notifier.success,
  error: notifier.error,
  /** Turns a request rejection into its friendly domain message. */
  failure(error: unknown, fallback?: string): void {
    toast.error(errorMessage(error, fallback))
  },
}
