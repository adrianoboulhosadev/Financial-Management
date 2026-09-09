import { MonthlyTotalsCalculator, RecordTransaction, GetMyMonthlyTotalsQuery } from '../src'
import { ValidationError } from 'shared'
import { TransactionRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

test('adds up what came in, what went out and what is left', () => {
  const totals = MonthlyTotalsCalculator.calculate([
    { type: 'income', categoryId: null, amount: 500000 },
    { type: 'expense', categoryId: 'lazer', amount: 20000 },
    { type: 'expense', categoryId: 'lazer', amount: 5000 },
    { type: 'expense', categoryId: 'casa', amount: 180000 },
  ])

  expect(totals.incomeCents).toBe(500000)
  expect(totals.expenseCents).toBe(205000)
  expect(totals.netCents).toBe(295000)
})

test('an income never counts as spending on a category', () => {
  const totals = MonthlyTotalsCalculator.calculate([
    { type: 'income', categoryId: 'salario', amount: 500000 },
    { type: 'expense', categoryId: 'salario', amount: 1000 },
  ])
  // Only the expense shows up under the category, even sharing the same id.
  expect(totals.byCategory).toEqual([{ categoryId: 'salario', spentCents: 1000 }])
})

test('categories come back biggest spender first', () => {
  const totals = MonthlyTotalsCalculator.calculate([
    { type: 'expense', categoryId: 'lazer', amount: 5000 },
    { type: 'expense', categoryId: 'casa', amount: 180000 },
    { type: 'expense', categoryId: 'mercado', amount: 90000 },
  ])
  expect(totals.byCategory.map((total) => total.categoryId)).toEqual(['casa', 'mercado', 'lazer'])
})

test('a month with nothing in it is zero, not empty state to handle', () => {
  expect(MonthlyTotalsCalculator.calculate([])).toEqual({
    incomeCents: 0,
    expenseCents: 0,
    netCents: 0,
    byCategory: [],
    totalByCategory: [],
    committedExpenseCents: 0,
    committedIncomeCents: 0,
  })
})

test('spending more than came in leaves a negative net', () => {
  const totals = MonthlyTotalsCalculator.calculate([
    { type: 'income', categoryId: null, amount: 100000 },
    { type: 'expense', categoryId: 'casa', amount: 150000 },
  ])
  expect(totals.netCents).toBe(-50000)
})

test('the query sums exactly the requested month', async () => {
  const repository = new TransactionRepositoryInMemory()
  const record = new RecordTransaction(repository)
  await record.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'lazer',
    description: 'Cinema',
    amount: 4500,
    occurredOn: day('2026-08-31'),
  })
  await record.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'lazer',
    description: 'Show',
    amount: 12000,
    occurredOn: day('2026-09-01'),
  })

  const august = await new GetMyMonthlyTotalsQuery(repository).execute({
    ownerId: owner,
    period: '2026-08',
  })
  // The last day of August counts; the 1st of September does not.
  expect(august.expenseCents).toBe(4500)
})

test('an invalid period is refused by the MonthPeriod value object', async () => {
  const repository = new TransactionRepositoryInMemory()
  const query = new GetMyMonthlyTotalsQuery(repository).execute({
    ownerId: owner,
    period: '2026-13',
  })
  await expect(query).rejects.toBeInstanceOf(ValidationError)
})

test('a commitment is counted apart from what actually moved', () => {
  // The month spent 400 and still owes 3000 of fixed bills. `expenseCents`
  // stays at what MOVED — that is what a ceiling is measured against — and the
  // dashboard is the one that adds the two together.
  const totals = MonthlyTotalsCalculator.calculate(
    [{ type: 'expense', categoryId: 'mercado', amount: 40000 }],
    [
      { type: 'expense', categoryId: 'casa', amount: 250000 },
      { type: 'expense', categoryId: 'mercado', amount: 50000 },
    ],
  )

  expect(totals.expenseCents).toBe(40000)
  expect(totals.committedExpenseCents).toBe(300000)
  expect(totals.byCategory).toEqual([{ categoryId: 'mercado', spentCents: 40000 }])
  // The ranking the dashboard shows has to add up to the figure it leads with,
  // so it folds the commitments in — and merges them into the category that
  // already spent something instead of listing it twice.
  expect(totals.totalByCategory).toEqual([
    { categoryId: 'casa', spentCents: 250000 },
    { categoryId: 'mercado', spentCents: 90000 },
  ])
})

test('a committed income does not become realized income', () => {
  const totals = MonthlyTotalsCalculator.calculate(
    [],
    [{ type: 'income', categoryId: null, amount: 400000 }],
  )

  expect(totals.incomeCents).toBe(0)
  expect(totals.committedIncomeCents).toBe(400000)
  // Nothing was spent, so nothing to rank — a committed income is not a
  // category total.
  expect(totals.totalByCategory).toEqual([])
})
