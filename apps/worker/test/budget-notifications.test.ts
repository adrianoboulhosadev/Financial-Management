import { BudgetUsageDTO } from '@budget/adapters'
import { Notification } from '@notification/adapters'
import { notificationFor } from '../src/budget/budget-notifications'

const owner = 'user-1'
const period = '2026-08'

const usage = (overrides: Partial<BudgetUsageDTO> = {}): BudgetUsageDTO => ({
  budgetId: 'budget-1',
  categoryId: 'lazer',
  limitCents: 50000,
  spentCents: 40000,
  remainingCents: 10000,
  percentage: 80,
  status: 'warning',
  ...overrides,
})

test('a warning names the category and how far along the month is', () => {
  const item = notificationFor(usage(), owner, 'Lazer', period)!
  const notification = Notification.for(item)

  expect(item.type).toBe('budget_warning')
  expect(notification.body).toContain('Lazer')
  expect(notification.body).toContain('80%')
  expect(notification.link).toBe('/budgets')
})

test('a blown ceiling is a different notice, not a louder warning', () => {
  const item = notificationFor(
    usage({ status: 'exceeded', spentCents: 62000, remainingCents: -12000, percentage: 124 }),
    owner,
    'Lazer',
    period,
  )!

  expect(item.type).toBe('budget_exceeded')
  expect(Notification.for(item).body).toContain('R$ 620,00')
})

test('nothing is said while the month is still fine', () => {
  expect(notificationFor(usage({ status: 'ok' }), owner, 'Lazer', period)).toBeNull()
})

test('the reference pins the notice to ceiling + month + severity', () => {
  const warning = notificationFor(usage(), owner, 'Lazer', period)!
  const exceeded = notificationFor(usage({ status: 'exceeded' }), owner, 'Lazer', period)!

  // Every further expense in the same month rebuilds the SAME key, so the
  // unique index turns the repeat into a no-op instead of a second line.
  expect(warning.referenceId).toBe('budget-1:2026-08:warning')
  // Crossing 100% after 80% is worse news and must still get through.
  expect(exceeded.referenceId).toBe('budget-1:2026-08:exceeded')
  // A new month starts the conversation over.
  expect(notificationFor(usage(), owner, 'Lazer', '2026-09')!.referenceId).toBe(
    'budget-1:2026-09:warning',
  )
})

test('the notice goes to the ceiling owner and nobody else', () => {
  expect(notificationFor(usage(), owner, 'Lazer', period)!.userId).toBe(owner)
})
