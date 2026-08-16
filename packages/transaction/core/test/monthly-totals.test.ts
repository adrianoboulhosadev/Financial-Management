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
    categoryIsLeaf: true,
  })
  await record.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'lazer',
    description: 'Show',
    amount: 12000,
    occurredOn: day('2026-09-01'),
    categoryIsLeaf: true,
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
