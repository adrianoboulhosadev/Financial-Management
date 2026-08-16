import { ValidationError, NotFoundError, Errors } from 'shared'
import {
  Notification,
  NotificationInput,
  SendNotifications,
  ListMyNotificationsQuery,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
  DeleteAllNotifications,
} from '../src'
import { NotificationRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const other = 'user-2'

/** A distinct, fully-formed event — handy wherever a test just needs N lines. */
const posted = (index: number, userId = owner): NotificationInput => ({
  userId,
  type: 'recurrence_posted',
  description: 'Aluguel',
  amount: 100 * index,
  movement: 'expense',
  referenceId: `rec-${index}`,
})

test('a notification requires a recipient, a title and a body', () => {
  expect(() => new Notification({ type: 'account_approved', title: 'x', body: 'y' })).toThrow(
    ValidationError,
  )
  expect(() => new Notification({ userId: owner, type: 'account_approved', body: 'y' })).toThrow(
    ValidationError,
  )
  expect(() => new Notification({ userId: owner, type: 'account_approved', title: 'x' })).toThrow(
    ValidationError,
  )
})

test('an unknown type is rejected', () => {
  const build = () =>
    // Forced past the type system on purpose: the row could come from an older
    // deploy, so the entity re-checks it on reconstitution.
    new Notification({ userId: owner, type: 'nope' as never, title: 'x', body: 'y' })
  expect(build).toThrow(ValidationError)
})

test('a fresh notification is unread', () => {
  const notification = Notification.for({ userId: owner, type: 'account_approved' })
  expect(notification.isRead).toBe(false)
  expect(notification.readAt).toBeNull()
})

test('markAsRead is idempotent — the second call keeps the first timestamp', () => {
  const notification = Notification.for({ userId: owner, type: 'account_approved' })
  notification.markAsRead()
  const firstRead = notification.readAt

  notification.markAsRead()

  expect(notification.readAt).toBe(firstRead)
})

test('a budget warning names the category and how far along it is', () => {
  const notification = Notification.for({
    userId: owner,
    type: 'budget_warning',
    categoryName: 'Lazer',
    limitCents: 50000,
    spentCents: 40000,
    percentage: 80,
    referenceId: 'budget-1:2026-08:warning',
  })

  expect(notification.title).toBe('Orçamento quase no limite')
  expect(notification.body).toContain('Lazer')
  expect(notification.body).toContain('80%')
  expect(notification.body).toContain('R$ 400,00')
  expect(notification.body).toContain('R$ 500,00')
  expect(notification.link).toBe('/budgets')
})

test('a blown budget says how far past the ceiling the month already is', () => {
  const notification = Notification.for({
    userId: owner,
    type: 'budget_exceeded',
    categoryName: 'Mercado',
    limitCents: 100000,
    spentCents: 123456,
  })

  expect(notification.title).toBe('Orçamento estourado')
  expect(notification.body).toContain('Mercado')
  expect(notification.body).toContain('R$ 1.234,56')
  expect(notification.link).toBe('/budgets')
})

test('a posted recurrence reads differently for money in and money out', () => {
  const expense = Notification.for({
    userId: owner,
    type: 'recurrence_posted',
    description: 'Aluguel',
    amount: 180000,
    movement: 'expense',
  })
  const income = Notification.for({
    userId: owner,
    type: 'recurrence_posted',
    description: 'Salário',
    amount: 500000,
    movement: 'income',
  })

  expect(expense.title).toBe('Despesa fixa lançada')
  expect(expense.body).toContain('Aluguel')
  expect(expense.body).toContain('R$ 1.800,00')
  expect(expense.link).toBe('/transactions')
  expect(income.title).toBe('Receita fixa lançada')
  expect(income.body).toContain('Salário')
})

test("the admin notice links to the control room and names who's waiting", () => {
  const signup = Notification.for({
    userId: 'admin-1',
    type: 'admin_signup_pending',
    signupEmail: 'amigo@exemplo.com',
  })

  expect(signup.body).toContain('amigo@exemplo.com')
  expect(signup.link).toBe('/admin')
})

test('sending a batch delivers one notification per item', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [
      { userId: owner, type: 'account_approved' },
      { userId: other, type: 'account_approved' },
    ],
  })

  expect(repository.notifications).toHaveLength(2)
})

test('an empty batch touches nothing', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({ items: [] })
  expect(repository.notifications).toHaveLength(0)
})

test('re-delivering the SAME event does not duplicate the inbox line', async () => {
  const repository = new NotificationRepositoryInMemory()
  const items: NotificationInput[] = [
    {
      userId: owner,
      type: 'budget_exceeded',
      categoryName: 'Lazer',
      limitCents: 50000,
      spentCents: 60000,
      referenceId: 'budget-1:2026-08:exceeded',
    },
  ]

  // Two expenses in the same month re-trigger the very same crossing.
  await new SendNotifications(repository).execute({ items })
  await new SendNotifications(repository).execute({ items })

  expect(repository.notifications).toHaveLength(1)
})

test('the feed lists the newest first and counts every unread', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [posted(1), posted(2), posted(3, other)],
  })
  // Same millisecond otherwise — force a distinct order.
  repository.notifications[0].createdAt = new Date('2026-01-01T10:00:00Z')
  repository.notifications[1].createdAt = new Date('2026-01-01T11:00:00Z')

  const feed = await new ListMyNotificationsQuery(repository).execute({ userId: owner })

  expect(feed.items).toHaveLength(2) // never sees the other user's line
  expect(feed.items[0].body).toContain('R$ 2,00')
  expect(feed.unreadCount).toBe(2)
})

test('the unread count covers the whole inbox, not just the returned slice', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: Array.from({ length: 5 }, (_, index) => posted(index)),
  })

  const feed = await new ListMyNotificationsQuery(repository).execute({ userId: owner, limit: 2 })

  expect(feed.items).toHaveLength(2)
  expect(feed.unreadCount).toBe(5)
})

test('an absurd limit is clamped instead of dumping the table', async () => {
  const asked: number[] = []
  const spy = {
    async listByUserQuery(_userId: string, limit: number) {
      asked.push(limit)
      return []
    },
    async countUnreadQuery() {
      return 0
    },
  }

  await new ListMyNotificationsQuery(spy).execute({ userId: owner, limit: 9999 })
  await new ListMyNotificationsQuery(spy).execute({ userId: owner, limit: 0 })

  expect(asked).toEqual([100, 1])
})

test('marking as read clears it from the unread count', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [{ userId: owner, type: 'account_approved' }],
  })
  const id = repository.notifications[0].id

  await new MarkNotificationAsRead(repository).execute({ notificationId: id, userId: owner })

  const feed = await new ListMyNotificationsQuery(repository).execute({ userId: owner })
  expect(feed.unreadCount).toBe(0)
  expect(feed.items[0].read).toBe(true)
})

test("someone else's notification answers like a missing one (anti-IDOR)", async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [{ userId: owner, type: 'account_approved' }],
  })
  const id = repository.notifications[0].id

  const steal = new MarkNotificationAsRead(repository).execute({
    notificationId: id,
    userId: other,
  })

  await expect(steal).rejects.toBeInstanceOf(NotFoundError)
  await expect(steal).rejects.toMatchObject({ code: Errors.NOTIFICATION_NOT_FOUND })
  expect(repository.notifications[0].readAt).toBeNull() // untouched
})

test('marking a missing notification fails with NOTIFICATION_NOT_FOUND', async () => {
  const repository = new NotificationRepositoryInMemory()
  const mark = new MarkNotificationAsRead(repository).execute({
    notificationId: 'ghost',
    userId: owner,
  })
  await expect(mark).rejects.toMatchObject({ code: Errors.NOTIFICATION_NOT_FOUND })
})

test('marking all as read only touches my own inbox', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [posted(1), posted(2), posted(3, other)],
  })

  await new MarkAllNotificationsAsRead(repository).execute({ userId: owner })

  expect(await repository.countUnreadQuery(owner)).toBe(0)
  expect(await repository.countUnreadQuery(other)).toBe(1)
})

test('deleting a notification removes it from the inbox', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({ items: [posted(1), posted(2)] })
  const [first] = repository.notifications

  await new DeleteNotification(repository).execute({ notificationId: first.id, userId: owner })

  const feed = await new ListMyNotificationsQuery(repository).execute({ userId: owner })
  expect(feed.items).toHaveLength(1)
  expect(feed.items.some((item) => item.id === first.id)).toBe(false)
})

test("deleting someone else's notification answers like a missing one (anti-IDOR)", async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [{ userId: owner, type: 'account_approved' }],
  })
  const id = repository.notifications[0].id

  const steal = new DeleteNotification(repository).execute({ notificationId: id, userId: other })

  await expect(steal).rejects.toBeInstanceOf(NotFoundError)
  await expect(steal).rejects.toMatchObject({ code: Errors.NOTIFICATION_NOT_FOUND })
  expect(repository.notifications).toHaveLength(1)
})

test('clearing the inbox only empties my own', async () => {
  const repository = new NotificationRepositoryInMemory()
  await new SendNotifications(repository).execute({
    items: [posted(1), posted(2), posted(3, other)],
  })

  await new DeleteAllNotifications(repository).execute({ userId: owner })

  expect(repository.notifications).toHaveLength(1)
  expect(repository.notifications[0].userId).toBe(other)
})
