import { Investment, InvestmentContribution } from '../model'

/**
 * Contribution WRITE port (command side).
 *
 * `record` is a COMPOSED operation on purpose: filing the contribution and
 * raising the investment it went into are ONE fact, and doing them in two calls
 * would let a crash in between either lose the record of where the money went
 * or grow the investment with nothing explaining it. The adapter wraps both in
 * a single database transaction — the core never knows how.
 */
export interface InvestmentContributionRepository {
  record(contribution: InvestmentContribution, investment: Investment): Promise<void>
}
