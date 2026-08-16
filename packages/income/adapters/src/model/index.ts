// Rich entity re-exported as a VALUE: the app's Prisma repository reconstitutes
// it (`new IncomeSource({...})`) without importing @income/core. Adapters is the
// context's only public surface.
export { IncomeSource } from '@income/core'
export { MonthlyIncomeCalculator } from '@income/core'
