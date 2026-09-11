/**
 * The single source of truth for how the product LOOKS, shared by the web and
 * the mobile app.
 *
 * It lives in a package (and not in each app's Tailwind config) because the two
 * apps have to be visually IDENTICAL, and the only way to guarantee that is to
 * make a colour physically impossible to diverge: `apps/web/tailwind.config.ts`
 * and `apps/mobile/tailwind.config.ts` both extend the preset built from here.
 *
 * Plain TypeScript objects on purpose — no import, no runtime, nothing
 * platform-specific — so the same file is safe inside a React Native bundle and
 * inside a Node build script.
 */

/**
 * The neutral ground. A finance app is read as a column of numbers, so the
 * chrome stays quiet and lets the figures carry the colour.
 *
 * The named roles below are ALIASES onto the `neutral` ramp: a screen reaches
 * for `ink-text-muted` when it means "the quiet line under a title" and for
 * `neutral-600` when it is matching a specific step of the ramp. Two spellings
 * of one value, never two values.
 */
export const INK = {
  bg: '#161826',
  surface: '#232532',
  'surface-soft': '#2b2d3b',
  /** The hairline BETWEEN rows — a list divider, the top of the tab bar. */
  border: '#292b31',
  /** The outline AROUND a card, one step louder so a pane reads as a block. */
  'border-strong': '#3f424d',
  text: '#e9e9ed',
  'text-soft': '#9397ab',
  'text-muted': '#75798c',
} as const

/**
 * The grey ramp the chrome is built from. Nine steps because the design leans
 * on the distance between adjacent ones — a row divider (900) has to disappear
 * next to a card outline (800), and a hint (600) has to sit clearly below a
 * label (500) without either turning into body text.
 */
export const NEUTRAL = {
  100: '#f3f5fe',
  200: '#e4e7f5',
  300: '#cfd3e5',
  400: '#b2b6ca',
  500: '#9397ab',
  600: '#75798c',
  700: '#595d6c',
  800: '#3f424d',
  900: '#292b31',
} as const

/**
 * The accent ramp. `accent` itself is the interactive colour (the active tab,
 * the primary button, the checked box); the ramp exists because the same hue
 * has to work as a 900 tint behind an icon and as a 200 text on top of it.
 */
export const ACCENT = {
  DEFAULT: '#9184d9',
  100: '#f5f4ff',
  200: '#e7e5fe',
  300: '#d2cefd',
  400: '#b5abfc',
  500: '#968ae0',
  600: '#796cbf',
  700: '#5d5294',
  800: '#423a6a',
  900: '#2b2741',
} as const

/**
 * The ONLY saturated colours in the product, and each one means something:
 * money coming in, money going out, and a commitment the month still owes.
 * Nothing here is decorative — if a new colour is ever needed, it needs a
 * meaning first.
 *
 * `warning` is the SAME amber as a fixed commitment on purpose: "this month
 * still owes it" and "this ceiling is about to break" are the same warning to
 * the same person, and giving them two ambers would only ask the reader to
 * tell two shades apart for nothing.
 */
export const SEMANTIC = {
  positive: '#62c2a0',
  negative: '#e08b7a',
  warning: '#d9a96a',
} as const

export const COLORS = {
  ink: INK,
  neutral: NEUTRAL,
  accent: ACCENT,
  ...SEMANTIC,
} as const

/**
 * Corners. `card` is every pane in the product; `field` is the smaller radius
 * an input, a button and a chip-sized box share. Two values, because the design
 * genuinely uses two — anything rounder is a pill, which is `rounded-full`.
 */
export const RADIUS = { card: 14, field: 8 } as const

/**
 * Interface type. ONE family for the whole product: the amounts are set in the
 * same Inter as everything else and line up because they are rendered with
 * TABULAR figures, not because they are switched to a monospace.
 *
 * That is the whole reason there is no `mono` here any more. A second family
 * bought nothing the `tabular-nums` feature does not already give — the digits
 * were already fixed-width — and cost a second webfont on the web plus a second
 * `useFonts` entry on the phone.
 */
export const FONT_FAMILY = {
  sans: 'Inter',
} as const

/** Where the bottom tab bar stops and the sidebar takes over. Shared because
 * the two apps must agree on what counts as "phone". */
export const NAVIGATION_BREAKPOINT = 640

/**
 * Above this the browser stops rendering the app and shows the "open it on a
 * phone or tablet" card instead. Financial is designed as an app: every screen
 * is a single column sized for a thumb, and stretching that across a 27-inch
 * monitor would be a different product, not a wider one.
 */
export const DESKTOP_CUTOFF = 1024
