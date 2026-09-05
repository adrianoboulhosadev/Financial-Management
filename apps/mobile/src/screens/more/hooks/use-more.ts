import { useAuth } from 'ui'
import { SECONDARY_NAV } from '@/data/nav-items'

/** Everything the tab bar could not fit — the same overflow list the web shows
 * on a phone. */
export function useMore() {
  const { logout, user } = useAuth()

  return {
    user,
    items: SECONDARY_NAV,
    logout,
  }
}
