const { tailwindPreset } = require('ui')

/**
 * The SAME preset the web extends (`packages/ui`), so `bg-ink-surface` and
 * `text-positive` resolve to identical values in the browser and on the phone.
 * NativeWind reads this exactly like Tailwind reads the web's config.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  presets: [require('nativewind/preset'), tailwindPreset],
  content: ['./src/**/*.{ts,tsx}'],
}
