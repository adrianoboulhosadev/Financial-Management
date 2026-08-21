// FIRST import on purpose: `shared`'s Id uses uuid, which needs a crypto source
// React Native does not ship. Loading this polyfill after anything that
// touches it would already be too late.
import 'react-native-get-random-values'
import '../../global.css'

import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { AuthProvider, configureClient } from 'client'
import { Loading } from '@/components/loading'
import { Toaster } from '@/components/toaster'
import { notifier } from '@/lib/notify'
import { openEventStream } from '@/lib/event-stream'
import { secureTokenStorage } from '@/lib/token-storage'

/**
 * Wires the shared client to the PHONE's adapters, once, at module scope —
 * before any hook can render. The three adapters are the entire difference
 * between this app and the web: where the refresh token sleeps, how a message
 * is shown, and what carries the live inbox push.
 */
configureClient({
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000',
  clientType: 'mobile',
  tokenStorage: secureTokenStorage,
  notifier,
  eventStream: { open: openEventStream },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // The names match the shared tokens' `sans`/`mono`, which is what makes
    // `font-sans`/`font-mono` mean the same thing here and on the web.
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'JetBrains Mono': JetBrainsMono_400Regular,
  })

  useEffect(() => {
    // Nothing to do yet — kept as the seam where a splash screen would hide
    // until the fonts land, once there is an icon set to show.
  }, [fontsLoaded])

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          {fontsLoaded ? <Slot /> : <Loading fullScreen />}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
