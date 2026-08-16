import { ValidationError, NotFoundError, Errors } from 'shared'
import {
  Transaction,
  RecordTransaction,
  UpdateTransaction,
  DeleteTransaction,
  ListMyTransactionsQuery,
} from '../src'
import { TransactionRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

const expense = {
  ownerId: owner,
  type: 'expense',
  categoryId: 'lazer',
  description: 'Cinema',
  amount: 4500,
  occurredOn: day('2026-08-10'),
}

test('an expense always lands on a category', () => {
  expect(() => new Transaction({ ...expense, categoryId: null })).toThrow(ValidationError)
  try {
    new Transaction({ ...expense, categoryId: null })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.CATEGORY_REQUIRED_FOR_EXPENSE)
  }
})

test('a one-off income does not need a category', () => {
  const income = new Transaction({ ...expense, type: 'income', categoryId: null })
  expect(income.isExpense).toBe(false)
  expect(income.categoryId).toBeNull()
})

test('the amount is a positive magnitude — never zero, never negative', () => {
  expect(() => new Transaction({ ...expense, amount: 0 })).toThrow(ValidationError)
  expect(() => new Transaction({ ...expense, amount: -100 })).toThrow(ValidationError)
  // The direction is the type's job, so the stored number stays positive.
  expect(new Transaction(expense).amount.cents).toBe(4500)
})

test('rejects an unknown type, a blank description and a missing date', () => {
  expect(() => new Transaction({ ...expense, type: 'transfer' })).toThrow(ValidationError)
  expect(() => new Transaction({ ...expense, description: '   ' })).toThrow(ValidationError)
  expect(() => new Transaction({ ...expense, occurredOn: undefined })).toThrow(ValidationError)
})

test('editing re-applies the invariants instead of trusting the caller', () => {
  const transaction = new Transaction(expense)
  expect(() => transaction.edit({ amount: 0 })).toThrow(ValidationError)
  // Clearing the category of an EXPENSE is the same violation as creating one without it.
  expect(() => transaction.edit({ categoryId: null })).toThrow(ValidationError)
  transaction.edit({ description: '  Cinema com a Ana  ', amount: 6000 })
  expect(transaction.description).toBe('Cinema com a Ana')
  expect(transaction.amount.cents).toBe(6000)
})

test('records a movement through the use case', async () => {
  const repository = new TransactionRepositoryInMemory()
  await new RecordTransaction(repository).execute({ ...expense, categoryIsLeaf: true })
  expect(repository.transactions).toHaveLength(1)
  expect(repository.transactions[0].amount).toBe(4500)
})

test('money is filed on a LEAF, never on a branch (CATEGORY_NOT_LEAF)', async () => {
  const repository = new TransactionRepositoryInMemory()
  const record = new RecordTransaction(repository).execute({ ...expense, categoryIsLeaf: false })
  await expect(record).rejects.toBeInstanceOf(ValidationError)
  await expect(record).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_LEAF })
  expect(repository.transactions).toHaveLength(0)
})

test("someone else's movement answers as missing, never as forbidden (anti-IDOR)", async () => {
  const repository = new TransactionRepositoryInMemory()
  await new RecordTransaction(repository).execute({
    ...expense,
    ownerId: stranger,
    categoryIsLeaf: true,
  })
  const foreign = repository.transactions[0].id

  const edit = new UpdateTransaction(repository).execute({
    ownerId: owner,
    transactionId: foreign,
    amount: 1,
  })
  await expect(edit).rejects.toBeInstanceOf(NotFoundError)
  await expect(edit).rejects.toMatchObject({ code: Errors.TRANSACTION_NOT_FOUND })

  const remove = new DeleteTransaction(repository).execute({
    ownerId: owner,
    transactionId: foreign,
  })
  await expect(remove).rejects.toMatchObject({ code: Errors.TRANSACTION_NOT_FOUND })
  expect(repository.transactions).toHaveLength(1)
})

test('updates and deletes the caller own movement', async () => {
  const repository = new TransactionRepositoryInMemory()
  await new RecordTransaction(repository).execute({ ...expense, categoryIsLeaf: true })
  const id = repository.transactions[0].id

  await new UpdateTransaction(repository).execute({
    ownerId: owner,
    transactionId: id,
    amount: 7000,
    description: 'Cinema IMAX',
  })
  expect(repository.transactions[0].amount).toBe(7000)
  expect(repository.transactions[0].description).toBe('Cinema IMAX')

  await new DeleteTransaction(repository).execute({ ownerId: owner, transactionId: id })
  expect(repository.transactions).toHaveLength(0)
})

test('listing is scoped to the owner and narrowed by the filter', async () => {
  const repository = new TransactionRepositoryInMemory()
  const record = new RecordTransaction(repository)
  await record.execute({ ...expense, categoryIsLeaf: true })
  await record.execute({ ...expense, occurredOn: day('2026-09-02'), categoryIsLeaf: true })
  await record.execute({ ...expense, type: 'income', categoryId: null, description: 'Freela' })
  await record.execute({ ...expense, ownerId: stranger, categoryIsLeaf: true })

  const query = new ListMyTransactionsQuery(repository)
  expect(await query.execute({ ownerId: owner })).toHaveLength(3)
  expect(await query.execute({ ownerId: owner, filter: { type: 'income' } })).toHaveLength(1)

  // August only: the exclusive upper bound keeps September out and the 10th in.
  const august = await query.execute({
    ownerId: owner,
    filter: { from: day('2026-08-01'), to: day('2026-09-01') },
  })
  expect(august).toHaveLength(2)
})
