'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { LoginUserInput, RegisterUserInput, UserDTO } from '@auth/adapters'
import { api, applyTokens, clearTokens, refreshAccessToken, type AuthTokens } from '../http/api'
import { clientConfig } from '../config'

// Reuses the DTO from adapters: both apps need the identity, the role (admin
// UI) and the display fields the navigation shows.
export type AuthenticatedUser = Pick<UserDTO, 'id' | 'email' | 'role' | 'nickname' | 'avatarUrl'>

interface Auth {
  user: AuthenticatedUser | null
  loading: boolean
  isAdmin: boolean
  login: (input: LoginUserInput) => Promise<void>
  register: (input: RegisterUserInput) => Promise<void>
  /** Google ID token (from the web's NextAuth bridge) — the backend verifies it
   * and issues the SAME session as `login`. */
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
  /** Re-reads /user/me — the profile screen edits fields the navigation shows. */
  refresh: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

/**
 * The session, shared by the web and the app. There is no routing in here on
 * purpose: WHERE an unauthenticated visitor is sent is the only part that
 * differs between Next's router and Expo Router, so each app keeps its own
 * guard and this provider stays platform-free.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const { data } = await api().get<AuthenticatedUser>('/user/me')
    setUser(data)
  }, [])

  // Silent refresh on boot: if the stored refresh is still valid, the session
  // comes back without a login screen.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        await refreshAccessToken()
        if (active) await loadUser()
      } catch {
        if (active) {
          await clearTokens()
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [loadUser])

  const login = useCallback(
    async (input: LoginUserInput) => {
      const { data } = await api().post<AuthTokens>('/auth/login', input)
      await applyTokens(data)
      await loadUser()
    },
    [loadUser],
  )

  // Sign-up does NOT log anyone in: this is a closed platform, so the account is
  // created and then waits for an admin to release it.
  const register = useCallback(async (input: RegisterUserInput) => {
    await api().post('/auth/register', input)
  }, [])

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const { data } = await api().post<AuthTokens>('/auth/oauth/google', { idToken })
      await applyTokens(data)
      await loadUser()
    },
    [loadUser],
  )

  const clearSession = useCallback(() => {
    void clearTokens()
    setUser(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      // Identifies WHICH device is signing out. Empty on the web (the cookie
      // carries it); the stored token on mobile.
      const refreshToken = await clientConfig().tokenStorage.getRefreshToken()
      await api().post('/user/logout', { refreshToken: refreshToken ?? undefined })
    } finally {
      await clearTokens()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogle,
        logout,
        clearSession,
        refresh: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): Auth {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an <AuthProvider>')
  return context
}
