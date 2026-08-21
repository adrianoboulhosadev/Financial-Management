/**
 * Entry point of its own, on purpose: a Tailwind config is loaded by a BUILD
 * tool, not by the app, and going through the package barrel would drag the
 * React contexts and the axios client in with it just to read a palette.
 * (It also breaks outright — the loader that reads this file resolves `.ts`,
 * not the `.tsx` of `auth-context`.)
 */
export { default } from './src/tailwind-preset'
