import type { Config } from 'tailwindcss'
import { COLORS, FONT_FAMILY, RADIUS } from './tokens'

/**
 * The Tailwind preset both apps extend, so `bg-ink-surface` and `text-positive`
 * mean the exact same thing in the browser and on the phone.
 *
 * It carries ONLY what NativeWind can honour on React Native — colours, radius,
 * font families. Web-only flourishes (box-shadow, keyframes) stay in
 * `apps/web/tailwind.config.ts`: putting them here would suggest a parity that
 * React Native cannot deliver, and a token that silently does nothing on one of
 * the two platforms is worse than no token.
 *
 * `content` is deliberately absent — each app knows where its own files are.
 */
const preset: Omit<Config, 'content'> = {
  theme: {
    extend: {
      colors: COLORS,
      borderRadius: { card: `${RADIUS.card}px` },
      fontFamily: {
        sans: [FONT_FAMILY.sans, 'ui-sans-serif', 'system-ui'],
        mono: [FONT_FAMILY.mono, 'ui-monospace', 'monospace'],
      },
    },
  },
}

export default preset
