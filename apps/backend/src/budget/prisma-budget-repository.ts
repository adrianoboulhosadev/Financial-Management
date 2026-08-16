import { Injectable } from '@nestjs/common'
import { BudgetRepository, BudgetQueryRepository, Budget, BudgetDTO } from '@budget/adapters'
import { PrismaService } from '../db/prisma.service'

interface BudgetRow {
  id: string
  ownerId: string
  categoryId: string
  amount: number
}

@Injectable()
export class PrismaBudgetRepository implements BudgetRepository, BudgetQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private reconstitute(row: BudgetRow): Budget {
    return new Budget({
      id: row.id,
      ownerId: row.ownerId,
      categoryId: row.categoryId,
      amount: row.amount,
    })
  }

  async findById(id: string): Promise<Budget | null> {
    const row = await this.prisma.budget.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async findByCategory(ownerId: string, categoryId: string): Promise<Budget | null> {
    const row = await this.prisma.budget.findUnique({
      where: { ownerId_categoryId: { ownerId, categoryId } },
    })
    return row ? this.reconstitute(row) : null
  }

  async create(budget: Budget): Promise<void> {
    await this.prisma.budget.create({
      data: {
        id: budget.id.value,
        ownerId: budget.ownerId,
        categoryId: budget.categoryId,
        amount: budget.amount.cents,
      },
    })
  }

  async update(budget: Budget): Promise<void> {
    await this.prisma.budget.update({
      where: { id: budget.id.value },
      data: { amount: budget.amount.cents },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } })
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    const found = await this.prisma.budget.findFirst({
      where: { categoryId },
      select: { id: true },
    })
    return found !== null
  }

  async listByOwnerQuery(ownerId: string): Promise<BudgetDTO[]> {
    return this.prisma.budget.findMany({
      where: { ownerId },
      select: { id: true, ownerId: true, categoryId: true, amount: true },
    })
  }

  async findByCategoryQuery(ownerId: string, categoryId: string): Promise<BudgetDTO | null> {
    return this.prisma.budget.findUnique({
      where: { ownerId_categoryId: { ownerId, categoryId } },
      select: { id: true, ownerId: true, categoryId: true, amount: true },
    })
  }
}
