import type { Config } from 'tailwindcss'
import tailwindPreset from 'ui/tailwind-preset'

/**
 * Colours, radius and fonts come from the SHARED preset (`packages/ui`), which
 * the mobile app extends too — that is what makes a token physically unable to
 * diverge between the two.
 *
 * What stays here is only what React Native cannot honour anyway: box-shadow
 * and CSS keyframes. Putting those in the preset would promise a parity that
 * does not exist.
 */
const config: Config = {
  presets: [tailwindPreset],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.35), 0 8px 24px -16px rgba(0,0,0,.8)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        fadeIn: 'fadeIn .25s ease-out',
        spinSlow: 'spinSlow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
