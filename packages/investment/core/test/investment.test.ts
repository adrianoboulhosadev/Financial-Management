import { ValidationError, ConflictError, NotFoundError, Errors } from 'shared'
import {
  Investment,
  InvestmentDTO,
  PortfolioCalculator,
  CreateInvestment,
  UpdateInvestment,
  SetInvestmentActive,
  DeleteInvestment,
  ListMyInvestmentsQuery,
  GetMyPortfolioQuery,
} from '../src'
import { InvestmentRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)
const cdb = {
  ownerId: owner,
  name: 'CDB Itaú 110%',
  kind: 'cdb',
  investedAmount: 500000,
  startedOn: day('2026-01-15'),
}

const row = (overrides: Partial<InvestmentDTO>): InvestmentDTO => ({
  id: 'i1',
  ownerId: owner,
  bankId: null,
  name: 'CDB',
  kind: 'cdb',
  investedAmount: 500000,
  currentAmount: null,
  startedOn: day('2026-01-15'),
  maturityOn: null,
  notes: null,
  active: true,
  ...overrides,
})

test('an investment needs a name, a real amount, a known kind and a start', () => {
  expect(() => new Investment({ ...cdb, name: '  ' })).toThrow(ValidationError)
  expect(() => new Investment({ ...cdb, investedAmount: 0 })).toThrow(ValidationError)
  expect(() => new Investment({ ...cdb, startedOn: undefined })).toThrow(ValidationError)
  expect(() => new Investment({ ...cdb, kind: 'nft' })).toThrow(ValidationError)
  try {
    new Investment({ ...cdb, kind: 'nft' })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_INVESTMENT_KIND)
  }
})

test('a maturity before the application date is not a date anyone meant', () => {
  expect(
    () => new Investment({ ...cdb, maturityOn: day('2025-01-15') }),
  ).toThrow(ValidationError)
  expect(new Investment({ ...cdb, maturityOn: day('2028-01-15') }).maturityOn).toEqual(
    day('2028-01-15'),
  )
})

test('with no current value an investment is worth what went in, not nothing', () => {
  const investment = new Investment(cdb)
  expect(investment.currentAmount).toBeNull()
  expect(investment.valueCents).toBe(500000)
  expect(investment.returnCents).toBe(0)
})

test('the return is SIGNED — a loss is exactly what has to be visible', () => {
  const up = new Investment({ ...cdb, currentAmount: 540000 })
  const down = new Investment({ ...cdb, currentAmount: 410000 })

  expect(up.returnCents).toBe(40000)
  expect(down.returnCents).toBe(-90000)
  // Being worth nothing today is a real state, unlike investing nothing.
  expect(new Investment({ ...cdb, currentAmount: 0 }).returnCents).toBe(-500000)
})

test('a rejected edit leaves the investment untouched', () => {
  const investment = new Investment(cdb)
  expect(() => investment.edit({ currentAmount: 540000, kind: 'nft' })).toThrow(ValidationError)
  expect(investment.currentAmount).toBeNull()
  expect(investment.kind).toBe('cdb')
})

test('only ACTIVE investments count towards the portfolio', () => {
  const portfolio = PortfolioCalculator.calculate([
    row({ id: '1', name: 'CDB', investedAmount: 500000, currentAmount: 540000 }),
    row({ id: '2', name: 'Tesouro', kind: 'treasury', investedAmount: 200000 }),
    row({ id: '3', name: 'Resgatado', investedAmount: 900000, active: false }),
  ])

  // 540000 + 200000 (no current value: worth what went in).
  expect(portfolio.valueCents).toBe(740000)
  expect(portfolio.investedCents).toBe(700000)
  expect(portfolio.returnCents).toBe(40000)
  expect(portfolio.investments).toHaveLength(2)
})

test('an empty portfolio is zero, not empty state to handle', () => {
  expect(PortfolioCalculator.calculate([])).toEqual({
    investedCents: 0,
    valueCents: 0,
    returnCents: 0,
    byKind: [],
    investments: [],
  })
})

test('the portfolio splits by kind, biggest holding first', () => {
  const portfolio = PortfolioCalculator.calculate([
    row({ id: '1', name: 'CDB A', kind: 'cdb', investedAmount: 100000, currentAmount: 110000 }),
    row({ id: '2', name: 'CDB B', kind: 'cdb', investedAmount: 200000, currentAmount: 190000 }),
    row({ id: '3', name: 'Ações', kind: 'stocks', investedAmount: 400000, currentAmount: 450000 }),
  ])

  expect(portfolio.byKind.map((slice) => slice.kind)).toEqual(['stocks', 'cdb'])
  const [stocks, cdbSlice] = portfolio.byKind
  expect(stocks.valueCents).toBe(450000)
  // The two CDBs are one slice: 110000 + 190000 against 300000 applied.
  expect(cdbSlice.valueCents).toBe(300000)
  expect(cdbSlice.returnCents).toBe(0)
})

test('the same owner cannot keep two investments with one name', async () => {
  const repository = new InvestmentRepositoryInMemory()
  const create = new CreateInvestment(repository)
  await create.execute(cdb)

  await expect(create.execute(cdb)).rejects.toBeInstanceOf(ConflictError)
  await expect(create.execute(cdb)).rejects.toMatchObject({
    code: Errors.INVESTMENT_ALREADY_EXISTS,
  })
  await create.execute({ ...cdb, ownerId: stranger })
  expect(repository.investments).toHaveLength(2)
})

test('writing down this month value is an ordinary edit', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute(cdb)
  const id = repository.investments[0].id

  await new UpdateInvestment(repository).execute({
    ownerId: owner,
    investmentId: id,
    currentAmount: 523400,
  })
  expect(repository.investments[0].currentAmount).toBe(523400)

  const portfolio = await new GetMyPortfolioQuery(repository).execute(owner)
  expect(portfolio.returnCents).toBe(23400)
})

test('redeeming drops it from the total but keeps the row', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute(cdb)
  const id = repository.investments[0].id

  await new SetInvestmentActive(repository).execute({
    ownerId: owner,
    investmentId: id,
    active: false,
  })

  expect(await new ListMyInvestmentsQuery(repository).execute(owner)).toHaveLength(1)
  expect((await new GetMyPortfolioQuery(repository).execute(owner)).valueCents).toBe(0)
})

test("someone else's investment answers as missing (anti-IDOR)", async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute({ ...cdb, ownerId: stranger })
  const foreign = repository.investments[0].id

  await expect(
    new UpdateInvestment(repository).execute({
      ownerId: owner,
      investmentId: foreign,
      currentAmount: 1,
    }),
  ).rejects.toBeInstanceOf(NotFoundError)
  await expect(
    new DeleteInvestment(repository).execute({ ownerId: owner, investmentId: foreign }),
  ).rejects.toMatchObject({ code: Errors.INVESTMENT_NOT_FOUND })

  expect(await new ListMyInvestmentsQuery(repository).execute(owner)).toHaveLength(0)
})
