import type { ExpoConfig } from 'expo/config'

/**
 * `newArchEnabled` is read by Expo (it comes back in `expo config --type
 * public`) but is not in `ExpoConfig` yet. Declared here instead of casting the
 * whole object, so every OTHER key stays type-checked.
 */
type MobileConfig = ExpoConfig & { newArchEnabled?: boolean }

/**
 * The native root view's colour, and the ONE place in this repo where a token
 * is written by hand instead of imported.
 *
 * It has to be: `ui` is a SOURCE-ONLY package (see CLAUDE.md), and the loader
 * that evaluates this file transpiles only the file itself — it cannot require
 * a `.ts` out of a dependency, which is exactly what `ui/tokens` would be. The
 * Tailwind preset gets away with its own entry point because the config loader
 * THERE does transpile the whole chain.
 *
 * Keep it equal to `COLORS.ink.bg` in `packages/ui/src/tokens.ts`.
 */
const INK_BG = '#161826'

/**
 * TypeScript and not app.json so the decisions below can carry the reason they
 * were made — a JSON file has nowhere to put one.
 */
const config: MobileConfig = {
  name: 'Financial',
  slug: 'financial',
  scheme: 'financial',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  // Honoured by expo-system-ui, which is what actually paints the NATIVE root
  // view. Without it the window under React is white, and the app flashes white
  // on every cold start before the first screen mounts.
  backgroundColor: INK_BG,
  newArchEnabled: true,
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-system-ui',
    './plugins/with-release-signing',
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.adrianoboulhosa.financial',
  },
  android: {
    package: 'com.adrianoboulhosa.financial',
    // `edgeToEdgeEnabled` used to live here and was REMOVED, not forgotten:
    // Android 16 makes edge-to-edge mandatory, so Expo dropped the switch and
    // warns on every prebuild while it is still declared.
  },
  extra: {
    router: {},
  },
}

export default config
