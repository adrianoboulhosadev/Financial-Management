'use client'

import { signIn } from 'next-auth/react'

/**
 * Starts the Google handshake through NextAuth. The session NextAuth creates is
 * disposable: useGoogleOAuthBridge immediately trades its ID token for OUR
 * access/refresh pair and drops it.
 *
 * Rendered only when the feature is on (see lib/features) — but hiding the
 * button protects nothing on its own; the real gate is the backend refusing the
 * route while GOOGLE_CLIENT_ID is unset.
 */
export function GoogleSignInButton({ label = 'Entrar com Google' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn('google')}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-ink-border bg-ink-surface-soft px-4 py-2.5 text-sm font-medium text-ink-text transition-colors hover:border-ink-border-strong"
    >
      <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.5-4.8h-4v3.1A12 12 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.5 14.4a7.2 7.2 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.5 6.7l4 3.1C6.4 6.9 9 4.8 12 4.8Z"
        />
      </svg>
      {label}
    </button>
  )
}
