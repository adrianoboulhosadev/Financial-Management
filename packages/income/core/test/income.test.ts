import { ValidationError, ConflictError, NotFoundError, Errors } from 'shared'
import {
  IncomeSource,
  MonthlyIncomeCalculator,
  CreateIncomeSource,
  UpdateIncomeSource,
  SetIncomeSourceActive,
  DeleteIncomeSource,
  ListMyIncomeSourcesQuery,
  GetMyMonthlyIncomeQuery,
} from '../src'
import { IncomeSourceRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const salary = { ownerId: owner, name: 'Salário', amount: 500000, payday: 5 }

test('a source needs a name, a real amount and a payday inside the month', () => {
  expect(() => new IncomeSource({ ...salary, name: '  ' })).toThrow(ValidationError)
  expect(() => new IncomeSource({ ...salary, amount: 0 })).toThrow(ValidationError)
  expect(() => new IncomeSource({ ...salary, payday: 0 })).toThrow(ValidationError)
  expect(() => new IncomeSource({ ...salary, payday: 32 })).toThrow(ValidationError)
  try {
    new IncomeSource({ ...salary, payday: 45 })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_PAYDAY)
  }
})

test('a rejected edit leaves the source untouched', () => {
  const source = new IncomeSource(salary)
  expect(() => source.edit({ name: 'Novo', payday: 99 })).toThrow(ValidationError)
  expect(source.name).toBe('Salário')
  expect(source.payday).toBe(5)
})

test('the same owner cannot keep two sources with one name', async () => {
  const repository = new IncomeSourceRepositoryInMemory()
  const create = new CreateIncomeSource(repository)
  await create.execute(salary)

  await expect(create.execute(salary)).rejects.toBeInstanceOf(ConflictError)
  await expect(create.execute(salary)).rejects.toMatchObject({
    code: Errors.INCOME_SOURCE_ALREADY_EXISTS,
  })
  // Another owner using the very same name is nobody's business but theirs.
  await create.execute({ ...salary, ownerId: stranger })
  expect(repository.sources).toHaveLength(2)
})

test('renaming to its own current name is not a clash with itself', async () => {
  const repository = new IncomeSourceRepositoryInMemory()
  await new CreateIncomeSource(repository).execute(salary)
  const id = repository.sources[0].id

  await new UpdateIncomeSource(repository).execute({
    ownerId: owner,
    incomeSourceId: id,
    name: 'Salário',
    amount: 550000,
  })
  expect(repository.sources[0].amount).toBe(550000)
})

test("someone else's source answers as missing (anti-IDOR)", async () => {
  const repository = new IncomeSourceRepositoryInMemory()
  await new CreateIncomeSource(repository).execute({ ...salary, ownerId: stranger })
  const foreign = repository.sources[0].id

  const edit = new UpdateIncomeSource(repository).execute({
    ownerId: owner,
    incomeSourceId: foreign,
    amount: 1,
  })
  await expect(edit).rejects.toBeInstanceOf(NotFoundError)
  await expect(edit).rejects.toMatchObject({ code: Errors.INCOME_SOURCE_NOT_FOUND })

  const remove = new DeleteIncomeSource(repository).execute({
    ownerId: owner,
    incomeSourceId: foreign,
  })
  await expect(remove).rejects.toMatchObject({ code: Errors.INCOME_SOURCE_NOT_FOUND })
})

test('only ACTIVE sources count towards the month', () => {
  const monthly = MonthlyIncomeCalculator.calculate([
    { id: '1', ownerId: owner, name: 'Salário', amount: 500000, payday: 5, active: true },
    { id: '2', ownerId: owner, name: 'Freela fixo', amount: 120000, payday: 20, active: true },
    { id: '3', ownerId: owner, name: 'Emprego antigo', amount: 400000, payday: 1, active: false },
  ])

  expect(monthly.totalCents).toBe(620000)
  expect(monthly.sources).toHaveLength(2)
  // Earliest payday first — the order the money actually arrives in.
  expect(monthly.sources.map((source) => source.name)).toEqual(['Salário', 'Freela fixo'])
})

test('no active source means zero income, not a missing number', () => {
  expect(MonthlyIncomeCalculator.calculate([])).toEqual({ totalCents: 0, sources: [] })
})

test('deactivating drops the source from the total but keeps the row', async () => {
  const repository = new IncomeSourceRepositoryInMemory()
  await new CreateIncomeSource(repository).execute(salary)
  const id = repository.sources[0].id

  await new SetIncomeSourceActive(repository).execute({
    ownerId: owner,
    incomeSourceId: id,
    active: false,
  })

  expect(await new ListMyIncomeSourcesQuery(repository).execute(owner)).toHaveLength(1)
  expect((await new GetMyMonthlyIncomeQuery(repository).execute(owner)).totalCents).toBe(0)
})

test('the monthly income adds up the caller own active sources', async () => {
  const repository = new IncomeSourceRepositoryInMemory()
  const create = new CreateIncomeSource(repository)
  await create.execute(salary)
  await create.execute({ ownerId: owner, name: 'Aluguel recebido', amount: 90000, payday: 10 })
  await create.execute({ ownerId: stranger, name: 'Salário', amount: 999900, payday: 5 })

  const monthly = await new GetMyMonthlyIncomeQuery(repository).execute(owner)
  expect(monthly.totalCents).toBe(590000)
})
