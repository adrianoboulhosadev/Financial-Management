import { ValidationError, NotFoundError, Errors } from 'shared'
import {
  Budget,
  BudgetUsageCalculator,
  SetBudget,
  DeleteBudget,
  ListMyBudgetsQuery,
  GetMyBudgetUsageQuery,
  EvaluateBudgetAlert,
} from '../src'
import { BudgetRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'

test('a ceiling needs an owner, a category and a real amount', () => {
  expect(() => new Budget({ ownerId: owner, categoryId: 'lazer', amount: 0 })).toThrow(
    ValidationError,
  )
  expect(() => new Budget({ ownerId: owner, categoryId: ' ', amount: 50000 })).toThrow(
    ValidationError,
  )
  expect(() => new Budget({ ownerId: ' ', categoryId: 'lazer', amount: 50000 })).toThrow(
    ValidationError,
  )
})

test('setting the same category twice adjusts the ceiling instead of stacking rows', async () => {
  const repository = new BudgetRepositoryInMemory()
  const setBudget = new SetBudget(repository)

  await setBudget.execute({ ownerId: owner, categoryId: 'lazer', amount: 50000 })
  await setBudget.execute({ ownerId: owner, categoryId: 'lazer', amount: 80000 })

  expect(repository.budgets).toHaveLength(1)
  expect(repository.budgets[0].amount).toBe(80000)
})

test('a ceiling belongs on a leaf, not on a branch (CATEGORY_NOT_LEAF)', async () => {
  const repository = new BudgetRepositoryInMemory()
  const set = new SetBudget(repository).execute({
    ownerId: owner,
    categoryId: 'casa',
    amount: 50000,
    categoryIsLeaf: false,
  })
  await expect(set).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_LEAF })
  expect(repository.budgets).toHaveLength(0)
})

test('each user only sees their own ceilings', async () => {
  const repository = new BudgetRepositoryInMemory()
  const setBudget = new SetBudget(repository)
  await setBudget.execute({ ownerId: owner, categoryId: 'lazer', amount: 50000 })
  await setBudget.execute({ ownerId: stranger, categoryId: 'lazer', amount: 999900 })

  const mine = await new ListMyBudgetsQuery(repository).execute(owner)
  expect(mine).toHaveLength(1)
  expect(mine[0].amount).toBe(50000)
})

test("deleting someone else's ceiling answers as missing (anti-IDOR)", async () => {
  const repository = new BudgetRepositoryInMemory()
  await new SetBudget(repository).execute({
    ownerId: stranger,
    categoryId: 'lazer',
    amount: 50000,
  })
  const foreign = repository.budgets[0].id

  const remove = new DeleteBudget(repository).execute({ ownerId: owner, budgetId: foreign })
  await expect(remove).rejects.toBeInstanceOf(NotFoundError)
  await expect(remove).rejects.toMatchObject({ code: Errors.BUDGET_NOT_FOUND })
  expect(repository.budgets).toHaveLength(1)
})

test('classifies how much of the ceiling is gone', () => {
  const budget = { id: 'b1', ownerId: owner, categoryId: 'lazer', amount: 50000 }

  expect(BudgetUsageCalculator.evaluate(budget, 0).status).toBe('ok')
  expect(BudgetUsageCalculator.evaluate(budget, 39999).status).toBe('ok')
  // 80% on the dot is already a warning — the threshold is inclusive.
  expect(BudgetUsageCalculator.evaluate(budget, 40000).status).toBe('warning')
  expect(BudgetUsageCalculator.evaluate(budget, 49999).status).toBe('warning')
  // Spending exactly the ceiling counts as exceeded: there is nothing left.
  expect(BudgetUsageCalculator.evaluate(budget, 50000).status).toBe('exceeded')
})

test('going over leaves a negative remainder, which is the point', () => {
  const budget = { id: 'b1', ownerId: owner, categoryId: 'lazer', amount: 50000 }
  const usage = BudgetUsageCalculator.evaluate(budget, 65000)

  expect(usage.remainingCents).toBe(-15000)
  expect(usage.percentage).toBe(130)
  expect(usage.status).toBe('exceeded')
})

test('a ceiling with no spending still shows up, at zero', () => {
  const usage = BudgetUsageCalculator.calculate(
    [{ id: 'b1', ownerId: owner, categoryId: 'lazer', amount: 50000 }],
    [],
  )
  expect(usage).toHaveLength(1)
  expect(usage[0]).toMatchObject({ spentCents: 0, remainingCents: 50000, percentage: 0 })
})

test('the fullest ceiling comes first — that is the one worth looking at', () => {
  const usage = BudgetUsageCalculator.calculate(
    [
      { id: 'b1', ownerId: owner, categoryId: 'lazer', amount: 50000 },
      { id: 'b2', ownerId: owner, categoryId: 'mercado', amount: 100000 },
      { id: 'b3', ownerId: owner, categoryId: 'carro', amount: 20000 },
    ],
    [
      { categoryId: 'lazer', spentCents: 10000 },
      { categoryId: 'mercado', spentCents: 95000 },
      { categoryId: 'carro', spentCents: 10000 },
    ],
  )
  expect(usage.map((entry) => entry.categoryId)).toEqual(['mercado', 'carro', 'lazer'])
})

test('spending on a category with no ceiling is simply not reported', () => {
  const usage = BudgetUsageCalculator.calculate(
    [{ id: 'b1', ownerId: owner, categoryId: 'lazer', amount: 50000 }],
    [
      { categoryId: 'lazer', spentCents: 10000 },
      { categoryId: 'sem-teto', spentCents: 999999 },
    ],
  )
  expect(usage).toHaveLength(1)
})

test('the usage query crosses the ceilings with the spending the app resolved', async () => {
  const repository = new BudgetRepositoryInMemory()
  await new SetBudget(repository).execute({ ownerId: owner, categoryId: 'lazer', amount: 50000 })

  const usage = await new GetMyBudgetUsageQuery(repository).execute({
    ownerId: owner,
    spending: [{ categoryId: 'lazer', spentCents: 45000 }],
  })

  expect(usage[0]).toMatchObject({ spentCents: 45000, remainingCents: 5000, status: 'warning' })
})

test('the alert stays silent while everything is fine', async () => {
  const repository = new BudgetRepositoryInMemory()
  await new SetBudget(repository).execute({ ownerId: owner, categoryId: 'lazer', amount: 50000 })

  const evaluate = new EvaluateBudgetAlert(repository)
  expect(await evaluate.execute({ ownerId: owner, categoryId: 'lazer', spentCents: 1000 })).toBeNull()
  // A category nobody put a ceiling on never promised anything, so it never breaks one.
  expect(
    await evaluate.execute({ ownerId: owner, categoryId: 'sem-teto', spentCents: 999999 }),
  ).toBeNull()
})

test('the alert speaks up at the warning threshold and when the ceiling is blown', async () => {
  const repository = new BudgetRepositoryInMemory()
  await new SetBudget(repository).execute({ ownerId: owner, categoryId: 'lazer', amount: 50000 })
  const evaluate = new EvaluateBudgetAlert(repository)

  const warning = await evaluate.execute({
    ownerId: owner,
    categoryId: 'lazer',
    spentCents: 40000,
  })
  expect(warning).toMatchObject({ status: 'warning', percentage: 80 })

  const exceeded = await evaluate.execute({
    ownerId: owner,
    categoryId: 'lazer',
    spentCents: 52000,
  })
  expect(exceeded).toMatchObject({ status: 'exceeded', remainingCents: -2000 })
})
