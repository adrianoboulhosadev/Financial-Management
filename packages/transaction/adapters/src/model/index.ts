// Rich entities re-exported as VALUES (they are classes, not interfaces): the
// app's Prisma repositories reconstitute them via the constructor —
// `new Transaction({...})` — without importing @transaction/core. Adapters is
// the context's only public surface.
export { Transaction, Recurrence, RecurrencePayment } from '@transaction/core'
// Domain services re-exported as VALUES too: the app calls their static methods.
export { MonthlyTotalsCalculator, MonthlyChecklistCalculator, InstallmentPlanner } from '@transaction/core'
// The payment methods table, read by both fronts to render the options instead
// of re-declaring what the domain already decided.
export { PAYMENT_METHODS, SELF_SETTLING_METHODS } from '@transaction/core'
