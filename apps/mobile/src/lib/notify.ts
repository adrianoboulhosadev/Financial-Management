import type { Notifier } from 'client'
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

export const notify = {
  success: notifier.success,
  error: notifier.error,
}
