import { ValidationError, NotFoundError, Errors } from 'shared'
import {
  MonthlyChecklistCalculator,
  RecurrencePayment,
  CreateRecurrence,
  SetRecurrencePaid,
  AdjustRecurrenceAmount,
  GetMonthlyChecklistQuery,
  RunRecurrence,
  RecurrenceDTO,
} from '../src'
import { RecurrenceRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const period = '2026-09'
// Mid-month, so a bill due on the 5th is already past and one due on the 20th
// is not — which is exactly what `autoPaid` turns on.
const midMonth = new Date('2026-09-15T12:00:00.000Z')

const recurrence = (overrides: Partial<RecurrenceDTO>): RecurrenceDTO => ({
  id: 'r1',
  ownerId: owner,
  type: 'expense',
  categoryId: 'casa',
  description: 'Aluguel',
  amount: 250000,
  dayOfMonth: 5,
  active: true,
  variableAmount: false,
  autoPaid: false,
  bankId: null,
  cardId: null,
  paymentMethod: null,
  endsOn: null,
  nextRunAt: new Date('2026-10-05T00:00:00.000Z'),
  lastRunAt: null,
  ...overrides,
})

test('every active fixed bill is a line, with no row created in advance', () => {
  const checklist = MonthlyChecklistCalculator.calculate(
    period,
    [
      recurrence({}),
      recurrence({ id: 'r2', description: 'Streaming', amount: 5000, dayOfMonth: 20 }),
      recurrence({ id: 'r3', description: 'Academia antiga', active: false }),
    ],
    [],
    [],
    midMonth,
  )

  // The paused one is not a line: it is not owed.
  expect(checklist.items.map((item) => item.description)).toEqual(['Aluguel', 'Streaming'])
  expect(checklist.totalCents).toBe(255000)
  expect(checklist.pendingCents).toBe(255000)
  expect(checklist.items.every((item) => item.paid)).toBe(false)
})

test('the month costs the adjusted figure once the bill arrives', () => {
  const checklist = MonthlyChecklistCalculator.calculate(
    period,
    [recurrence({ id: 'r1', description: 'Luz', amount: 18000, variableAmount: true })],
    [{ id: 'p1', ownerId: owner, recurrenceId: 'r1', period, amount: 23450, paidAt: null }],
    [],
    midMonth,
  )

  const [light] = checklist.items
  expect(light.amountCents).toBe(23450)
  // The estimate travels alongside, so the surprise is visible on screen.
  expect(light.estimatedCents).toBe(18000)
  expect(checklist.totalCents).toBe(23450)
})

test('a bill on direct debit is already paid once its day has passed', () => {
  const checklist = MonthlyChecklistCalculator.calculate(
    period,
    [
      recurrence({ id: 'r1', description: 'Aluguel', dayOfMonth: 5, autoPaid: true }),
      recurrence({ id: 'r2', description: 'Cartão', dayOfMonth: 20, autoPaid: true, amount: 1000 }),
    ],
    [],
    [],
    midMonth,
  )

  const [rent, card] = checklist.items
  expect(rent.paid).toBe(true)
  // Nobody said so — it is settled because the bank takes it, which is why
  // there is no date to show.
  expect(rent.paidAt).toBeNull()
  expect(card.paid).toBe(false)
  expect(checklist.paidCents).toBe(250000)
  expect(checklist.pendingCents).toBe(1000)
})

test('a bill due TODAY on direct debit already counts as taken', () => {
  const checklist = MonthlyChecklistCalculator.calculate(
    period,
    [recurrence({ dayOfMonth: 15, autoPaid: true })],
    [],
    [],
    midMonth,
  )
  expect(checklist.items[0].paid).toBe(true)
})

test('the commitments of a month are the bills not yet posted', () => {
  const checklist = MonthlyChecklistCalculator.calculate(
    period,
    [
      recurrence({ id: 'r1', amount: 250000 }),
      recurrence({ id: 'r2', description: 'Streaming', amount: 5000, dayOfMonth: 20 }),
    ],
    [],
    // The worker already turned the rent into a real movement this month, so
    // counting it again would charge the month twice.
    ['r1'],
    midMonth,
  )

  expect(checklist.items.find((item) => item.recurrenceId === 'r1')?.posted).toBe(true)
  expect(MonthlyChecklistCalculator.commitmentsOf(checklist, midMonth)).toEqual([
    { type: 'expense', categoryId: 'casa', amount: 5000 },
  ])
})

test('a month already over commits to nothing', () => {
  const checklist = MonthlyChecklistCalculator.calculate(period, [recurrence({})], [], [], midMonth)
  // Whatever August was going to cost either got posted or never happened;
  // adding it in October would rewrite a closed month.
  const inOctober = new Date('2026-10-02T00:00:00.000Z')
  expect(MonthlyChecklistCalculator.commitmentsOf(checklist, inOctober)).toEqual([])
})

test('ticking a month off writes only the deviation, and un-ticking drops it', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const payments = repository.paymentRepository
  await new CreateRecurrence(repository).execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Aluguel',
    amount: 250000,
    dayOfMonth: 5,
  })
  const id = repository.recurrences[0].id
  const setPaid = new SetRecurrencePaid(repository, payments)

  await setPaid.execute({ ownerId: owner, recurrenceId: id, period, paid: true })
  expect(payments.payments).toHaveLength(1)
  expect(payments.payments[0].paidAt).not.toBeNull()

  // Ticking twice must not move the date it was paid on, nor add a row.
  const paidAt = payments.payments[0].paidAt
  await setPaid.execute({ ownerId: owner, recurrenceId: id, period, paid: true })
  expect(payments.payments).toHaveLength(1)
  expect(payments.payments[0].paidAt).toEqual(paidAt)

  // Un-ticking leaves nothing worth remembering, so the row goes away.
  await setPaid.execute({ ownerId: owner, recurrenceId: id, period, paid: false })
  expect(payments.payments).toHaveLength(0)
})

test('only a VARIABLE bill accepts a per-month amount', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const payments = repository.paymentRepository
  const create = new CreateRecurrence(repository)
  await create.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Aluguel',
    amount: 250000,
    dayOfMonth: 5,
  })
  await create.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Luz',
    amount: 18000,
    dayOfMonth: 12,
    variableAmount: true,
  })
  const [rent, light] = repository.recurrences
  const adjust = new AdjustRecurrenceAmount(repository, payments)

  const onFixed = adjust.execute({
    ownerId: owner,
    recurrenceId: rent.id,
    period,
    amount: 260000,
  })
  await expect(onFixed).rejects.toBeInstanceOf(ValidationError)
  await expect(onFixed).rejects.toMatchObject({ code: Errors.RECURRENCE_NOT_VARIABLE })

  await adjust.execute({ ownerId: owner, recurrenceId: light.id, period, amount: 23450 })
  expect(payments.payments[0].amount).toBe(23450)

  // Clearing it puts the estimate back in charge and, with nothing else
  // recorded, leaves no row behind.
  await adjust.execute({ ownerId: owner, recurrenceId: light.id, period, amount: null })
  expect(payments.payments).toHaveLength(0)
})

test('an adjusted amount survives un-ticking the month', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const payments = repository.paymentRepository
  await new CreateRecurrence(repository).execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Luz',
    amount: 18000,
    dayOfMonth: 12,
    variableAmount: true,
  })
  const id = repository.recurrences[0].id

  await new AdjustRecurrenceAmount(repository, payments).execute({
    ownerId: owner,
    recurrenceId: id,
    period,
    amount: 23450,
  })
  await new SetRecurrencePaid(repository, payments).execute({
    ownerId: owner,
    recurrenceId: id,
    period,
    paid: false,
  })

  // What the bill came to is true whether or not it is settled.
  expect(payments.payments).toHaveLength(1)
  expect(payments.payments[0].amount).toBe(23450)
  expect(payments.payments[0].paidAt).toBeNull()
})

test("someone else's fixed bill answers as missing (anti-IDOR)", async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const payments = repository.paymentRepository
  await new CreateRecurrence(repository).execute({
    ownerId: stranger,
    type: 'expense',
    categoryId: 'casa',
    description: 'Aluguel',
    amount: 250000,
    dayOfMonth: 5,
    variableAmount: true,
  })
  const foreign = repository.recurrences[0].id

  await expect(
    new SetRecurrencePaid(repository, payments).execute({
      ownerId: owner,
      recurrenceId: foreign,
      period,
      paid: true,
    }),
  ).rejects.toBeInstanceOf(NotFoundError)
  await expect(
    new AdjustRecurrenceAmount(repository, payments).execute({
      ownerId: owner,
      recurrenceId: foreign,
      period,
      amount: 1000,
    }),
  ).rejects.toMatchObject({ code: Errors.RECURRENCE_NOT_FOUND })
  expect(payments.payments).toHaveLength(0)
})

test('the checklist query only ever sees the caller own bills', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const create = new CreateRecurrence(repository)
  await create.execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Aluguel',
    amount: 250000,
    dayOfMonth: 5,
  })
  await create.execute({
    ownerId: stranger,
    type: 'expense',
    categoryId: 'casa',
    description: 'Aluguel do vizinho',
    amount: 999900,
    dayOfMonth: 5,
  })

  const checklist = await new GetMonthlyChecklistQuery(repository).execute({
    ownerId: owner,
    period,
  })
  expect(checklist.items).toHaveLength(1)
  expect(checklist.totalCents).toBe(250000)
})

test('the worker posts the adjusted amount of a variable bill, not the estimate', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const payments = repository.paymentRepository
  await new CreateRecurrence(repository).execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Luz',
    amount: 18000,
    dayOfMonth: 12,
    variableAmount: true,
  })
  const id = repository.recurrences[0].id
  const due = repository.recurrences[0].nextRunAt
  const duePeriod = due.toISOString().slice(0, 7)

  await payments.save(
    new RecurrencePayment({ ownerId: owner, recurrenceId: id, period: duePeriod, amount: 23450 }),
  )
  await new RunRecurrence(repository, undefined, payments).execute({ recurrenceId: id })

  // Posting the estimate would put a number on the month the owner had already
  // corrected.
  expect(repository.transactionRepository.transactions[0].amount).toBe(23450)
})

test('with no bill recorded yet, the estimate is what gets posted', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({
    ownerId: owner,
    type: 'expense',
    categoryId: 'casa',
    description: 'Luz',
    amount: 18000,
    dayOfMonth: 12,
    variableAmount: true,
  })
  const id = repository.recurrences[0].id

  await new RunRecurrence(repository, undefined, repository.paymentRepository).execute({
    recurrenceId: id,
  })
  expect(repository.transactionRepository.transactions[0].amount).toBe(18000)
})

test('um fixo com prazo sai da lista sozinho quando o prazo passa', () => {
  // The course was paid over three months and September is past its deadline:
  // the line is simply not there any more, without anyone pausing anything.
  const ended = recurrence({
    id: 'r1',
    description: 'Curso',
    amount: 30000,
    endsOn: new Date('2026-08-10T00:00:00.000Z'),
    dayOfMonth: 10,
  })

  const august = MonthlyChecklistCalculator.calculate(
    '2026-08',
    [ended],
    [],
    [],
    new Date('2026-08-15T12:00:00.000Z'),
  )
  expect(august.items).toHaveLength(1)
  // Its LAST month, so the screen can say so before it disappears.
  expect(august.items[0].lastMonth).toBe(true)

  const september = MonthlyChecklistCalculator.calculate(period, [ended], [], [], midMonth)
  expect(september.items).toHaveLength(0)
  expect(september.totalCents).toBe(0)
})

test('o dia do vencimento ainda é devido no mês em que o prazo cai', () => {
  // The deadline IS the day the last instalment is paid, not the day after it.
  const ending = recurrence({ endsOn: new Date('2026-09-05T00:00:00.000Z'), dayOfMonth: 5 })
  const checklist = MonthlyChecklistCalculator.calculate(period, [ending], [], [], midMonth)

  expect(checklist.items).toHaveLength(1)
  expect(checklist.items[0].lastMonth).toBe(true)
})

test('um fixo sem prazo nunca é o último mês', () => {
  const checklist = MonthlyChecklistCalculator.calculate(period, [recurrence({})], [], [], midMonth)
  expect(checklist.items[0].lastMonth).toBe(false)
})
