import { errorMessage, type Notifier } from 'ui'
import { showToast } from '@/components/toaster/toast-bus'

/**
 * The app's adapter of the `Notifier` port. The shared hooks announce through
 * the port, so the same mutation raises a sonner toast on the web and this one
 * on the phone without either knowing the other exists.
 */
export const notifier: Notifier = {
  success(message) {
    showToast({ message, tone: 'success' })
  },
  error(message) {
    showToast({ message, tone: 'error' })
  },
}

/**
 * What the screens call directly. `failure` exists here for the same reason it
 * exists on the web: a rejected request has to read as its friendly DOMAIN
 * message on both, and leaving it out on one of them is how the same error ends
 * up phrased two different ways.
 */
export const notify = {
  success: notifier.success,
  error: notifier.error,
  /** Turns a request rejection into its friendly domain message. */
  failure(error: unknown, fallback?: string): void {
    notifier.error(errorMessage(error, fallback))
  },
}
