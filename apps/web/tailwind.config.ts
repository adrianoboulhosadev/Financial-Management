import type { Config } from 'tailwindcss'

/**
 * Sober, dark, money-first design tokens. The palette leads with a neutral
 * slate ground so the only saturated things on screen are the numbers that
 * matter: `positive` for money coming in and `negative` for money going out.
 * Those two are the product's whole vocabulary, so they are tokens rather than
 * ad-hoc greens and reds scattered through the components.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: '#0b1016',
          surface: '#121a23',
          'surface-soft': '#18222d',
          border: '#243141',
          'border-strong': '#324356',
          text: '#e7eef6',
          'text-soft': '#a9b8c9',
          'text-muted': '#6d8096',
        },
        // The two directions money moves. Never used decoratively.
        positive: '#34d399',
        negative: '#f87171',
        accent: '#4f9cf9',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        // Amounts are read in columns and compared at a glance, so they get
        // tabular figures of their own.
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.35), 0 8px 24px -16px rgba(0,0,0,.8)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        sweep: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(300%)' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        fadeIn: 'fadeIn .25s ease-out',
        sweep: 'sweep 1.4s ease-in-out infinite',
        spinSlow: 'spinSlow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
