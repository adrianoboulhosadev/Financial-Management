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
  /**
   * `packages/ui` is scanned too, and it is NOT optional: the shared class
   * tables (BUDGET_STATUS_CLASSES, TONE_CLASSES, the inbox/approval badges)
   * spell out utilities that appear NOWHERE else, so leaving the package out
   * purged them from the CSS — the budget bars rendered with a transparent
   * fill and the status badges lost their colour.
   */
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
}

export default config
