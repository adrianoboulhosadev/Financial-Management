import { Transaction } from '@transaction/adapters'
import { notificationFor } from '../src/recurrence/recurrence-notifications'

const owner = 'user-1'
const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

const posted = (overrides: Record<string, unknown> = {}) =>
  new Transaction({
    ownerId: owner,
    type: 'expense',
    categoryId: 'moradia',
    description: 'Aluguel',
    amount: 180000,
    occurredOn: day('2026-08-05'),
    recurrenceId: 'rec-1',
    ...overrides,
  })

test('announces the posted expense to its owner', () => {
  const transaction = posted()
  const notification = notificationFor(transaction)

  expect(notification.userId).toBe(owner)
  expect(notification.title).toBe('Despesa fixa lançada')
  expect(notification.body).toContain('Aluguel')
  expect(notification.body).toContain('R$ 1.800,00')
  expect(notification.link).toBe('/transactions')
})

test('an income reads as money coming in, not going out', () => {
  const notification = notificationFor(
    posted({ type: 'income', categoryId: null, description: 'Salário', amount: 500000 }),
  )

  expect(notification.title).toBe('Receita fixa lançada')
  expect(notification.body).toContain('Salário')
})

test('the reference is the movement itself, so a redelivered job says nothing twice', () => {
  const transaction = posted()

  // The same job rebuilds the same transaction id, so the notification's
  // (userId, type, referenceId) key collides and the write is skipped.
  expect(notificationFor(transaction).referenceId).toBe(transaction.id.value)
  expect(notificationFor(transaction).referenceId).toBe(notificationFor(transaction).referenceId)
})
