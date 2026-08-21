import type { Config } from 'tailwindcss'
import tailwindPreset from 'ui/tailwind-preset'

/**
 * The SAME preset the web extends (`packages/ui`), so `bg-ink-surface` and
 * `text-positive` resolve to identical values in the browser and on the phone.
 * NativeWind reads this exactly like Tailwind reads the web's config.
 *
 * It is a `.ts` config (not `.js`) because `ui` is a SOURCE-ONLY package: there
 * is no built `.js` to `require`, so the config has to go through Tailwind's
 * TypeScript loader — the same one the web's config already uses. The preset
 * comes from its own entry (`ui/tailwind-preset`), never from the barrel: see
 * the comment there.
 */
const config: Config = {
  presets: [require('nativewind/preset'), tailwindPreset],
  content: ['./src/**/*.{ts,tsx}'],
}

export default config
