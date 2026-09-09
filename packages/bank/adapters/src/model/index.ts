// Rich entities re-exported as VALUES (they are classes, not interfaces): the
// app's Prisma repositories reconstitute them via the constructor —
// `new Bank({...})` — without importing @bank/core. Adapters is the context's
// only public surface.
export { Bank, Card } from '@bank/core'
// The kinds table is a VALUE too: the app and the fronts render the options
// from it instead of re-declaring what the domain already decided.
export { CARD_KINDS } from '@bank/core'
