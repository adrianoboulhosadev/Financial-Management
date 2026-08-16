// Rich entities re-exported as VALUES (they are classes, not interfaces): the
// app's Prisma repositories reconstitute them via the constructor —
// `new Transaction({...})` — without importing @transaction/core. Adapters is
// the context's only public surface.
export { Transaction, Recurrence } from '@transaction/core'
// Domain service re-exported as a VALUE too: the app calls its static methods.
export { MonthlyTotalsCalculator } from '@transaction/core'
