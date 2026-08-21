import { useAdminUsers } from 'client'

/** The screen has no state of its own — a listing plus two actions — so it
 * reads the shared hook straight through. Kept as a screen hook anyway, so the
 * view stays pure and gains a home if a filter ever shows up. */
export function useAdminScreen() {
  return useAdminUsers()
}
