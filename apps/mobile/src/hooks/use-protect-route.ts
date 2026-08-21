import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from 'client'

/** Private-area guard: without a session, back to the login. Same rule as the
 * web's — only the router differs, which is why it is not shared. */
export function useProtectRoute() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  return { allowed: !loading && Boolean(user) }
}
