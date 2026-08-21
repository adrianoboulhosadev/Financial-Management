'use client'

import { useAdminUsers } from 'client'

/** The screen has no state of its own — it is a listing plus two actions — so
 * it reads the shared hook straight through. Kept as a route hook anyway, so
 * the page stays pure JSX and gains a home if a filter ever shows up. */
export function useAdmin() {
  return useAdminUsers()
}
