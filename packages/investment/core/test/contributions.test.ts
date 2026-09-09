import { ValidationError, NotFoundError, Errors } from 'shared'
import {
  Investment,
  CreateInvestment,
  ContributeToInvestment,
  GetInvestedInPeriodQuery,
  GetMyPortfolioQuery,
  SetInvestmentActive,
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

test('um aporte sobe o aplicado E o valor de hoje', () => {
  // Os 200 estão lá dentro agora: subir só o aplicado reportaria o aporte como
  // um prejuízo instantâneo de exatamente 200.
  const investment = new Investment({ ...cdb, currentAmount: 540000 })

  investment.contribute(20000)

  expect(investment.investedAmount.cents).toBe(520000)
  expect(investment.currentAmount?.cents).toBe(560000)
  // O rendimento continua sendo o mesmo que era antes do aporte.
  expect(investment.returnCents).toBe(40000)
})

test('sem valor atual, o aporte só sobe o aplicado', () => {
  // Já valia o que foi aplicado, então não há nada a corrigir.
  const investment = new Investment(cdb)
  investment.contribute(20000)

  expect(investment.investedAmount.cents).toBe(520000)
  expect(investment.currentAmount).toBeNull()
  expect(investment.returnCents).toBe(0)
})

test('aportar nada, ou num investimento resgatado, é recusado', () => {
  const investment = new Investment(cdb)

  expect(() => investment.contribute(0)).toThrow(ValidationError)
  expect(() => investment.contribute(-100)).toThrow(ValidationError)

  investment.deactivate()
  try {
    investment.contribute(20000)
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVESTMENT_NOT_ACTIVE)
  }
  // E a recusa não deixou o valor aplicado mexido.
  expect(investment.investedAmount.cents).toBe(500000)
})

test('o aporte é gravado junto com o investimento que ele fez crescer', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute(cdb)
  const id = repository.investments[0].id

  await new ContributeToInvestment(repository, repository).execute({
    ownerId: owner,
    investmentId: id,
    amount: 20000,
    occurredOn: day('2026-09-20'),
  })

  expect(repository.contributions).toHaveLength(1)
  expect(repository.investments[0].investedAmount).toBe(520000)
  expect((await new GetMyPortfolioQuery(repository).execute(owner)).valueCents).toBe(520000)
})

test('o mês sabe quanto da sobra já foi investido', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute(cdb)
  const id = repository.investments[0].id
  const contribute = new ContributeToInvestment(repository, repository)

  await contribute.execute({
    ownerId: owner,
    investmentId: id,
    amount: 20000,
    occurredOn: day('2026-09-20'),
  })
  await contribute.execute({
    ownerId: owner,
    investmentId: id,
    amount: 5000,
    occurredOn: day('2026-09-30'),
  })
  // Outro mês não entra na conta deste.
  await contribute.execute({
    ownerId: owner,
    investmentId: id,
    amount: 90000,
    occurredOn: day('2026-10-01'),
  })

  const query = new GetInvestedInPeriodQuery(repository)
  expect(await query.execute({ ownerId: owner, period: '2026-09' })).toBe(25000)
  expect(await query.execute({ ownerId: owner, period: '2026-10' })).toBe(90000)
  // Um mês sem aporte é zero, não um número faltando.
  expect(await query.execute({ ownerId: owner, period: '2026-08' })).toBe(0)
})

test('um aporte recusado não deixa linha nenhuma pra trás', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute(cdb)
  const id = repository.investments[0].id
  await new SetInvestmentActive(repository).execute({
    ownerId: owner,
    investmentId: id,
    active: false,
  })

  const contribute = new ContributeToInvestment(repository, repository).execute({
    ownerId: owner,
    investmentId: id,
    amount: 20000,
    occurredOn: day('2026-09-20'),
  })

  await expect(contribute).rejects.toMatchObject({ code: Errors.INVESTMENT_NOT_ACTIVE })
  expect(repository.contributions).toHaveLength(0)
  expect(repository.investments[0].investedAmount).toBe(500000)
})

test('não dá pra aportar no investimento de outra pessoa (anti-IDOR)', async () => {
  const repository = new InvestmentRepositoryInMemory()
  await new CreateInvestment(repository).execute({ ...cdb, ownerId: stranger })
  const foreign = repository.investments[0].id

  const contribute = new ContributeToInvestment(repository, repository).execute({
    ownerId: owner,
    investmentId: foreign,
    amount: 20000,
    occurredOn: day('2026-09-20'),
  })

  await expect(contribute).rejects.toBeInstanceOf(NotFoundError)
  await expect(contribute).rejects.toMatchObject({ code: Errors.INVESTMENT_NOT_FOUND })
  expect(repository.contributions).toHaveLength(0)
})
