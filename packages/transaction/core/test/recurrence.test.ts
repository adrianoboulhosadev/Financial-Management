import { ValidationError, NotFoundError, Errors, MonthPeriod } from 'shared'
import {
  Recurrence,
  CreateRecurrence,
  UpdateRecurrence,
  SetRecurrenceActive,
  DeleteRecurrence,
  RunRecurrence,
  ListMyRecurrencesQuery,
} from '../src'
import { RecurrenceRepositoryInMemory, RecurrenceQueueInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'
const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

const rent = {
  ownerId: owner,
  type: 'expense',
  categoryId: 'moradia',
  description: 'Aluguel',
  amount: 180000,
  dayOfMonth: 5,
}

test('rejects a day of month outside 1-31', () => {
  expect(() => new Recurrence({ ...rent, dayOfMonth: 0 })).toThrow(ValidationError)
  expect(() => new Recurrence({ ...rent, dayOfMonth: 32 })).toThrow(ValidationError)
  try {
    new Recurrence({ ...rent, dayOfMonth: 40 })
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_DAY_OF_MONTH)
  }
})

test('a day the month does not have is clamped, never rolled into the next one', () => {
  // The 31st in February lands on the 28th (29th on a leap year) — it never
  // becomes March 3rd, which is what a naive Date would do.
  expect(Recurrence.nextOccurrenceFrom(31, day('2026-02-01')).toISOString()).toBe(
    '2026-02-28T00:00:00.000Z',
  )
  expect(Recurrence.nextOccurrenceFrom(31, day('2024-02-01')).toISOString()).toBe(
    '2024-02-29T00:00:00.000Z',
  )
})

test('the first run is this month when the day has not passed, next month otherwise', () => {
  expect(Recurrence.nextOccurrenceFrom(5, day('2026-08-01')).toISOString()).toBe(
    '2026-08-05T00:00:00.000Z',
  )
  // Created ON its own due day: still posts today, it does not wait a month.
  expect(Recurrence.nextOccurrenceFrom(5, day('2026-08-05')).toISOString()).toBe(
    '2026-08-05T00:00:00.000Z',
  )
  expect(Recurrence.nextOccurrenceFrom(5, day('2026-08-06')).toISOString()).toBe(
    '2026-09-05T00:00:00.000Z',
  )
})

test('markPosted advances a whole month and records what was posted', () => {
  const recurrence = new Recurrence({ ...rent, nextRunAt: day('2026-08-05') })
  recurrence.markPosted()
  expect(recurrence.lastRunAt?.toISOString()).toBe('2026-08-05T00:00:00.000Z')
  expect(recurrence.nextRunAt.toISOString()).toBe('2026-09-05T00:00:00.000Z')
})

test('a paused recurrence refuses to post (RECURRENCE_NOT_ACTIVE)', () => {
  const recurrence = new Recurrence({ ...rent, active: false })
  expect(() => recurrence.markPosted()).toThrow(ValidationError)
  try {
    recurrence.markPosted()
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.RECURRENCE_NOT_ACTIVE)
  }
})

test('creating schedules the first run through the queue', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const queue = new RecurrenceQueueInMemory()
  await new CreateRecurrence(repository, queue).execute({ ...rent, categoryIsLeaf: true })

  expect(repository.recurrences).toHaveLength(1)
  expect(queue.scheduled).toHaveLength(1)
  expect(queue.last?.recurrenceId).toBe(repository.recurrences[0].id)
  expect(queue.last?.at).toEqual(repository.recurrences[0].nextRunAt)
})

test('the queue is optional — a caller that does not schedule still creates', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  expect(repository.recurrences).toHaveLength(1)
})

test('a fixed expense also has to point at a LEAF category', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const create = new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: false })
  await expect(create).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_LEAF })
})

test('running posts the month occurrence and schedules the next', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const queue = new RecurrenceQueueInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id
  const due = repository.recurrences[0].nextRunAt

  await new RunRecurrence(repository, queue).execute({ recurrenceId: id })

  const posted = repository.transactionRepository.transactions
  expect(posted).toHaveLength(1)
  expect(posted[0]).toMatchObject({
    ownerId: owner,
    type: 'expense',
    categoryId: 'moradia',
    description: 'Aluguel',
    amount: 180000,
    recurrenceId: id,
  })
  // Filed on the day it was DUE, so a job that fires late still lands in its month.
  expect(posted[0].occurredOn).toEqual(due)
  expect(queue.last?.at).toEqual(repository.recurrences[0].nextRunAt)
  expect(repository.recurrences[0].nextRunAt.getTime()).toBeGreaterThan(due.getTime())
})

test('running the same month twice posts once (the queue delivers at least once)', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id

  await new RunRecurrence(repository).execute({ recurrenceId: id })
  const afterFirst = repository.recurrences[0].nextRunAt
  // A retry of the SAME job: the entity is reloaded from the advanced row, so
  // the second attempt is already looking at the following month.
  await new RunRecurrence(repository).execute({ recurrenceId: id })

  expect(repository.transactionRepository.transactions).toHaveLength(2)
  expect(repository.recurrences[0].nextRunAt.getTime()).toBeGreaterThan(afterFirst.getTime())
})

test('a paused or deleted recurrence runs to nothing instead of failing', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id
  await new SetRecurrenceActive(repository).execute({
    ownerId: owner,
    recurrenceId: id,
    active: false,
  })

  await new RunRecurrence(repository).execute({ recurrenceId: id })
  expect(repository.transactionRepository.transactions).toHaveLength(0)

  // A job left over for a recurrence that no longer exists is equally harmless.
  await expect(
    new RunRecurrence(repository).execute({ recurrenceId: 'ghost' }),
  ).resolves.toBeUndefined()
})

test('resuming re-schedules from today instead of owing the months it slept', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const queue = new RecurrenceQueueInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id
  const setActive = new SetRecurrenceActive(repository, queue)

  await setActive.execute({ ownerId: owner, recurrenceId: id, active: false })
  await setActive.execute({ ownerId: owner, recurrenceId: id, active: true })

  const expected = Recurrence.nextOccurrenceFrom(rent.dayOfMonth, new Date())
  expect(repository.recurrences[0].nextRunAt).toEqual(expected)
  expect(repository.recurrences[0].active).toBe(true)
})

test('changing the day re-schedules the recurrence', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const queue = new RecurrenceQueueInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id

  await new UpdateRecurrence(repository, queue).execute({
    ownerId: owner,
    recurrenceId: id,
    dayOfMonth: 20,
    amount: 190000,
  })

  expect(repository.recurrences[0].dayOfMonth).toBe(20)
  expect(repository.recurrences[0].amount).toBe(190000)
  expect(MonthPeriod.of(repository.recurrences[0].nextRunAt).dayAt(20)).toEqual(
    repository.recurrences[0].nextRunAt,
  )
  expect(queue.last?.at).toEqual(repository.recurrences[0].nextRunAt)
})

test("someone else's recurrence answers as missing (anti-IDOR)", async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({
    ...rent,
    ownerId: stranger,
    categoryIsLeaf: true,
  })
  const foreign = repository.recurrences[0].id

  const edit = new UpdateRecurrence(repository).execute({
    ownerId: owner,
    recurrenceId: foreign,
    amount: 1,
  })
  await expect(edit).rejects.toBeInstanceOf(NotFoundError)
  await expect(edit).rejects.toMatchObject({ code: Errors.RECURRENCE_NOT_FOUND })

  const remove = new DeleteRecurrence(repository).execute({
    ownerId: owner,
    recurrenceId: foreign,
  })
  await expect(remove).rejects.toMatchObject({ code: Errors.RECURRENCE_NOT_FOUND })
})

test('deleting the rule keeps the rows it already posted', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  const id = repository.recurrences[0].id
  await new RunRecurrence(repository).execute({ recurrenceId: id })

  await new DeleteRecurrence(repository).execute({ ownerId: owner, recurrenceId: id })

  expect(repository.recurrences).toHaveLength(0)
  // The money really moved — deleting the rule must not rewrite the past.
  expect(repository.transactionRepository.transactions).toHaveLength(1)
})

test('listing is scoped to the owner', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...rent, categoryIsLeaf: true })
  await new CreateRecurrence(repository).execute({
    ...rent,
    ownerId: stranger,
    categoryIsLeaf: true,
  })

  expect(await new ListMyRecurrencesQuery(repository).execute(owner)).toHaveLength(1)
})
