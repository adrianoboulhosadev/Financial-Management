// Rich entity re-exported as a VALUE: the app's Prisma repository reconstitutes
// it (`new Investment({...})`) without importing @investment/core. Adapters is
// the context's only public surface.
export { Investment, InvestmentContribution } from '@investment/core'
// Domain service re-exported as a VALUE too: the app calls its static methods.
export { PortfolioCalculator } from '@investment/core'
// The kinds table, read by both fronts to render the options.
export { INVESTMENT_KINDS } from '@investment/core'
