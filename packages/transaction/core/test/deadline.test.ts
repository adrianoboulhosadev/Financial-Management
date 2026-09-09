import { ValidationError, Errors } from 'shared'
import { Recurrence, CreateRecurrence, UpdateRecurrence, RunRecurrence } from '../src'
import { RecurrenceRepositoryInMemory, RecurrenceQueueInMemory } from './in-memory'

const owner = 'user-1'
const course = {
  ownerId: owner,
  type: 'expense',
  categoryId: 'educacao',
  description: 'Curso de inglês',
  amount: 30000,
  dayOfMonth: 10,
}

test('"8 meses" são 8 cobranças, a primeira sendo a que já está agendada', () => {
  const recurrence = new Recurrence({
    ...course,
    nextRunAt: new Date('2026-09-10T00:00:00.000Z'),
  })

  recurrence.limitToMonths(8)

  // Setembro é a 1ª, abril é a 8ª.
  expect(recurrence.endsOn?.toISOString().slice(0, 10)).toBe('2027-04-10')
})

test('um único mês termina no próprio mês', () => {
  const recurrence = new Recurrence({
    ...course,
    nextRunAt: new Date('2026-09-10T00:00:00.000Z'),
  })
  recurrence.limitToMonths(1)
  expect(recurrence.endsOn?.toISOString().slice(0, 10)).toBe('2026-09-10')
})

test('o prazo respeita o clamp de mês curto, igual à agenda', () => {
  const recurrence = new Recurrence({
    ...course,
    dayOfMonth: 31,
    nextRunAt: new Date('2026-12-31T00:00:00.000Z'),
  })

  recurrence.limitToMonths(3)

  // Fevereiro não tem 31, e o prazo cai no último dia — nunca vira março.
  expect(recurrence.endsOn?.toISOString().slice(0, 10)).toBe('2027-02-28')
})

test('duração precisa ser um número inteiro de meses', () => {
  const recurrence = new Recurrence(course)

  expect(() => recurrence.limitToMonths(0)).toThrow(ValidationError)
  expect(() => recurrence.limitToMonths(-3)).toThrow(ValidationError)
  expect(() => recurrence.limitToMonths(2.5)).toThrow(ValidationError)
  try {
    recurrence.limitToMonths(0)
  } catch (error) {
    expect((error as ValidationError).code).toBe(Errors.INVALID_RECURRENCE_DURATION)
  }
  // E um fixo sem prazo continua sem prazo depois da recusa.
  expect(recurrence.endsOn).toBeNull()
})

test('o último dia ainda é devido; o dia seguinte não', () => {
  const recurrence = new Recurrence({ ...course, endsOn: new Date('2027-04-10T00:00:00.000Z') })

  expect(recurrence.endedBy(new Date('2027-04-10T00:00:00.000Z'))).toBe(false)
  expect(recurrence.endedBy(new Date('2027-05-10T00:00:00.000Z'))).toBe(true)
  // Sem prazo nada acaba.
  expect(new Recurrence(course).endedBy(new Date('2099-01-01T00:00:00.000Z'))).toBe(false)
})

test('criar com duração já grava o prazo', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...course, durationMonths: 8 })

  expect(repository.recurrences[0].endsOn).not.toBeNull()
})

test('editar recontagem o prazo a partir da próxima ocorrência, e null limpa', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  await new CreateRecurrence(repository).execute({ ...course, durationMonths: 2 })
  const id = repository.recurrences[0].id
  const update = new UpdateRecurrence(repository)

  await update.execute({ ownerId: owner, recurrenceId: id, durationMonths: 6 })
  const extended = repository.recurrences[0].endsOn

  await update.execute({ ownerId: owner, recurrenceId: id, durationMonths: null })
  expect(repository.recurrences[0].endsOn).toBeNull()
  expect(extended).not.toBeNull()

  // Omitir a duração não mexe no prazo.
  await update.execute({ ownerId: owner, recurrenceId: id, durationMonths: 3 })
  await update.execute({ ownerId: owner, recurrenceId: id, description: 'Curso novo' })
  expect(repository.recurrences[0].endsOn).not.toBeNull()
})

test('passado o prazo, o worker não lança nem reagenda', async () => {
  const repository = new RecurrenceRepositoryInMemory()
  const queue = new RecurrenceQueueInMemory()
  await new CreateRecurrence(repository).execute({ ...course, durationMonths: 1 })
  const id = repository.recurrences[0].id

  // O único mês devido entra normalmente.
  await new RunRecurrence(repository, queue).execute({ recurrenceId: id })
  expect(repository.transactionRepository.transactions).toHaveLength(1)
  // E a corrente para aqui: não há job pro mês seguinte.
  expect(queue.scheduled).toHaveLength(0)

  // Uma redelivery depois do prazo não escreve nada.
  await new RunRecurrence(repository, queue).execute({ recurrenceId: id })
  expect(repository.transactionRepository.transactions).toHaveLength(1)
})
