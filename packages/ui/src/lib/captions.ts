/**
 * The second line under a row's name — "Mercado · Visa ····1234 · 3x".
 *
 * Everything it joins is OPTIONAL in the domain: a movement recorded before
 * banks existed has no card, an income needs no category, and most purchases
 * are not instalments. Joining with a filter is what lets a caller list every
 * part it might have and never produce " · · " for the ones it does not.
 */
export function caption(...parts: (string | number | null | undefined | false)[]): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined && part !== false && part !== '')
    .join(' · ')
}
