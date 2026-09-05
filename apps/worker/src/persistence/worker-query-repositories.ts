import { TransactionQueryRepository, TransactionDTO } from '@transaction/adapters'
import { BudgetQueryRepository, BudgetDTO } from '@budget/adapters'
import { NotificationRepository, Notification } from '@notification/adapters'
import { prisma } from './prisma'

/**
 * The read ports the budget check needs, plus the notification write port.
 * Each one implements only what this app actually calls; the methods the worker
 * never reaches for throw instead of pretending to work, so a wrong wiring
 * fails loudly at the first call rather than returning empty data forever.
 */
export class WorkerTransactionQueryRepository implements TransactionQueryRepository {
  async sumSpentByCategory(
    ownerId: string,
    categoryId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: { ownerId, categoryId, type: 'expense', occurredOn: { gte: from, lt: to } },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  }

  async listByOwnerQuery(): Promise<TransactionDTO[]> {
    throw new Error('the worker does not list movements')
  }

  async findByIdQuery(): Promise<TransactionDTO | null> {
    throw new Error('the worker does not read a single movement')
  }
}

export class WorkerBudgetQueryRepository implements BudgetQueryRepository {
  async findByCategoryQuery(ownerId: string, categoryId: string): Promise<BudgetDTO | null> {
    return prisma.budget.findUnique({
      where: { ownerId_categoryId: { ownerId, categoryId } },
      select: { id: true, ownerId: true, categoryId: true, amount: true },
    })
  }

  async listByOwnerQuery(): Promise<BudgetDTO[]> {
    throw new Error('the worker does not list ceilings')
  }
}

export class WorkerNotificationRepository implements NotificationRepository {
  async createMany(notifications: Notification[]): Promise<void> {
    await prisma.notification.createMany({
      data: notifications.map((notification) => ({
        id: notification.id.value,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        referenceId: notification.referenceId,
      })),
      skipDuplicates: true,
    })
  }

  async findById(): Promise<Notification | null> {
    throw new Error('the worker does not read notifications')
  }

  async update(): Promise<void> {
    throw new Error('the worker does not update notifications')
  }

  async markAllAsRead(): Promise<void> {
    throw new Error('the worker does not mark notifications as read')
  }

  async deleteById(): Promise<void> {
    throw new Error('the worker does not delete notifications')
  }

  async deleteAllByUser(): Promise<void> {
    throw new Error('the worker does not clear inboxes')
  }
}

/**
 * How a category is NAMED in a notification. Read straight from the table
 * instead of going through the `category` context: it decides nothing, it only
 * labels, and pulling a whole context in for one string would be the expensive
 * way to do it. A missing name falls back to a generic word — a renamed or
 * deleted category must never break the alert.
 */
export async function categoryNameOf(categoryId: string): Promise<string> {
  const row = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true },
  })
  return row?.name ?? 'a categoria'
}
