'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getAccessToken, onAccessTokenChange } from '../http/api'
import { clientConfig } from '../config'
import { NOTIFICATIONS_KEY } from './use-notifications'

/**
 * Keeps the inbox live, with no polling: the backend pushes a ping whenever
 * THIS user's inbox changes and the only thing this does with it is invalidate
 * the query — the cache layer then re-reads /notification, exactly as if the
 * user had navigated.
 *
 * WHICH transport carries the push is the platform's business (`EventSource` in
 * the browser, `react-native-sse` on the phone) and arrives through the
 * EventStreamFactory port.
 *
 * The token goes in the query string because SSE cannot send an Authorization
 * header — so the connection is recreated whenever the token rotates (login,
 * silent refresh, logout), which is what `onAccessTokenChange` is for. Mount
 * this ONCE, in the private layout.
 */
export function useNotificationStream() {
  const queryClient = useQueryClient()
  const { apiUrl, eventStream } = clientConfig()
  // Not a ref: the token arriving/rotating has to RE-RUN the effect below, and
  // only state does that.
  const [token, setToken] = useState<string | null>(() => getAccessToken())

  useEffect(() => onAccessTokenChange(setToken), [])

  useEffect(() => {
    if (!token) return

    // The teardown the port returns is what closes the connection; skipping it
    // leaks one connection per navigation.
    return eventStream.open(
      `${apiUrl}/notification/stream?token=${encodeURIComponent(token)}`,
      () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
    )
  }, [token, apiUrl, eventStream, queryClient])
}
