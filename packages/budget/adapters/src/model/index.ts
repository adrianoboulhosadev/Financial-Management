// Rich entity re-exported as a VALUE: the app's Prisma repository reconstitutes
// it (`new Budget({...})`) without importing @budget/core. Adapters is the
// context's only public surface.
export { Budget } from '@budget/core'
// Domain service re-exported as a VALUE too (the app calls its static methods
// and reads WARNING_RATIO when it words the alert).
export { BudgetUsageCalculator } from '@budget/core'
