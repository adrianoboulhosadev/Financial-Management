/**
 * The single source of truth for how the product LOOKS, shared by the web and
 * the mobile app.
 *
 * It lives in a package (and not in each app's Tailwind config) because the two
 * apps have to be visually IDENTICAL, and the only way to guarantee that is to
 * make a colour physically impossible to diverge: `apps/web/tailwind.config.ts`
 * and `apps/mobile/tailwind.config.js` both extend the preset built from here.
 *
 * Plain TypeScript objects on purpose — no import, no runtime, nothing
 * platform-specific — so the same file is safe inside a React Native bundle and
 * inside a Node build script.
 */

/**
 * The neutral ground. A finance app is read as a column of numbers, so the
 * chrome stays quiet and lets the figures carry the colour.
 */
export const INK = {
  bg: '#0b1016',
  surface: '#121a23',
  'surface-soft': '#18222d',
  border: '#243141',
  'border-strong': '#324356',
  text: '#e7eef6',
  'text-soft': '#a9b8c9',
  'text-muted': '#6d8096',
} as const

/**
 * The ONLY saturated colours in the product, and each one means something:
 * money coming in, money going out, the action to take, and a ceiling about to
 * break. Nothing here is decorative — if a new colour is ever needed, it needs
 * a meaning first.
 */
export const SEMANTIC = {
  positive: '#34d399',
  negative: '#f87171',
  accent: '#4f9cf9',
  warning: '#fbbf24',
} as const

export const COLORS = { ink: INK, ...SEMANTIC } as const

/** Corner of a card/surface. One value: consistency beats a scale nobody uses. */
export const RADIUS = { card: 14 } as const

/**
 * Interface type and the tabular monospace the amounts use — they are read in a
 * column and compared at a glance, which proportional figures make impossible.
 *
 * The names (`sans`/`mono`) are what both apps write as `font-sans`/`font-mono`;
 * WHICH file backs each name differs by platform (a CSS variable from next/font
 * on the web, a font loaded by expo-font on the app), and that is the only part
 * that is allowed to differ.
 */
export const FONT_FAMILY = {
  sans: 'Inter',
  mono: 'JetBrains Mono',
} as const

/** Where the bottom tab bar stops and the sidebar takes over. Shared because
 * the two apps must agree on what counts as "phone". */
export const NAVIGATION_BREAKPOINT = 640
