import { ValidationError, Errors } from 'shared'
import { InstallmentPlanner, RecordTransaction, Transaction } from '../src'
import { TransactionRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const purchase = {
  ownerId: owner,
  type: 'expense',
  categoryId: 'eletronicos',
  description: 'Notebook',
  amount: 600000,
  occurredOn: day('2026-09-10'),
  paymentMethod: 'credit',
}

test('the instalments always add up to the total, cents included', () => {
  // 100,00 in 3 does not divide: the leftover cent goes to the FIRST charge,
  // which is where a card issuer puts it, rather than hiding in the last one.
  const plan = InstallmentPlanner.plan(10000, 3, day('2026-09-10'))

  expect(plan.map((entry) => entry.amountCents)).toEqual([3334, 3333, 3333])
  expect(plan.reduce((total, entry) => total + entry.amountCents, 0)).toBe(10000)
})

test('each instalment lands one month later, on the same day', () => {
  const plan = InstallmentPlanner.plan(30000, 3, day('2026-11-10'))

  expect(plan.map((entry) => entry.occurredOn.toISOString().slice(0, 10))).toEqual([
    '2026-11-10',
    '2026-12-10',
    '2027-01-10',
  ])
  expect(plan.map((entry) => entry.installmentNumber)).toEqual([1, 2, 3])
})

test('a purchase on the 31st is charged on the last day of a shorter month', () => {
  const plan = InstallmentPlanner.plan(30000, 3, day('2026-12-31'))

  expect(plan.map((entry) => entry.occurredOn.toISOString().slice(0, 10))).toEqual([
    '2026-12-31',
    // February has no 31st, and the charge is clamped rather than rolled into
    // March — the same rule MonthPeriod.dayAt applies everywhere else.
    '2027-01-31',
    '2027-02-28',
  ])
})

test('splitting is a credit thing (INSTALLMENTS_REQUIRE_CREDIT)', () => {
  expect(
    () => new Transaction({ ...purchase, installments: 3, paymentMethod: 'pix' }),
  ).toThrow(ValidationError)
  try {
    new Transaction({ ...purchase, installments: 3, paymentMethod: 'debit' })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INSTALLMENTS_REQUIRE_CREDIT)
  }
})

test('a movement refuses an unknown payment method and an impossible split', () => {
  expect(() => new Transaction({ ...purchase, paymentMethod: 'bitcoin' })).toThrow(ValidationError)
  expect(() => new Transaction({ ...purchase, installments: 0 })).toThrow(ValidationError)
  expect(() => new Transaction({ ...purchase, installments: 60 })).toThrow(ValidationError)
  // "which of the N is this" only makes sense inside 1..N.
  expect(
    () => new Transaction({ ...purchase, installments: 3, installmentNumber: 4 }),
  ).toThrow(ValidationError)
})

test('a movement paid with no method at all is still a movement', () => {
  // Every row recorded before banks existed carries none, and reconstituting
  // those has to keep working.
  const transaction = new Transaction({ ...purchase, paymentMethod: undefined })
  expect(transaction.paymentMethod).toBeNull()
  expect(transaction.installments).toBe(1)
  expect(transaction.isInstallment).toBe(false)
})

test('a split purchase leaves one row per month, sharing a group', async () => {
  const repository = new TransactionRepositoryInMemory()
  await new RecordTransaction(repository).execute({ ...purchase, installments: 6 })

  expect(repository.transactions).toHaveLength(6)
  // `amount` is the TOTAL the owner typed, never the value of one instalment.
  expect(repository.transactions.reduce((total, row) => total + row.amount, 0)).toBe(600000)

  const groups = new Set(repository.transactions.map((row) => row.installmentGroupId))
  expect(groups.size).toBe(1)
  expect([...groups][0]).not.toBeNull()
  expect(repository.transactions.map((row) => row.installmentNumber)).toEqual([1, 2, 3, 4, 5, 6])
  expect(repository.transactions.every((row) => row.installments === 6)).toBe(true)
})

test('one instalment is just an ordinary movement, with no group', async () => {
  const repository = new TransactionRepositoryInMemory()
  await new RecordTransaction(repository).execute({ ...purchase, installments: 1 })

  expect(repository.transactions).toHaveLength(1)
  expect(repository.transactions[0].installmentGroupId).toBeNull()
  expect(repository.transactions[0].amount).toBe(600000)
})

test('a refused split writes nothing at all', async () => {
  const repository = new TransactionRepositoryInMemory()
  const record = new RecordTransaction(repository).execute({
    ...purchase,
    paymentMethod: 'pix',
    installments: 3,
  })

  await expect(record).rejects.toMatchObject({ code: Errors.INSTALLMENTS_REQUIRE_CREDIT })
  // Built up front precisely so a bad purchase cannot leave half its months.
  expect(repository.transactions).toHaveLength(0)
})
