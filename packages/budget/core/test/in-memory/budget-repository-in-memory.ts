import { Budget, BudgetDTO, BudgetRepository, BudgetQueryRepository } from '../../src'

interface BudgetRow {
  id: string
  ownerId: string
  categoryId: string
  amount: number
}

export default class BudgetRepositoryInMemory implements BudgetRepository, BudgetQueryRepository {
  readonly budgets: BudgetRow[] = []

  async findById(id: string): Promise<Budget | null> {
    const row = this.budgets.find((budget) => budget.id === id)
    return row ? new Budget(row) : null
  }

  async findByCategory(ownerId: string, categoryId: string): Promise<Budget | null> {
    const row = this.budgets.find(
      (budget) => budget.ownerId === ownerId && budget.categoryId === categoryId,
    )
    return row ? new Budget(row) : null
  }

  async create(budget: Budget): Promise<void> {
    this.budgets.push(this.toRow(budget))
  }

  async update(budget: Budget): Promise<void> {
    const index = this.budgets.findIndex((current) => current.id === budget.id.value)
    if (index >= 0) this.budgets[index] = this.toRow(budget)
  }

  async delete(id: string): Promise<void> {
    const index = this.budgets.findIndex((budget) => budget.id === id)
    if (index >= 0) this.budgets.splice(index, 1)
  }

  async existsByCategory(categoryId: string): Promise<boolean> {
    return this.budgets.some((budget) => budget.categoryId === categoryId)
  }

  async listByOwnerQuery(ownerId: string): Promise<BudgetDTO[]> {
    return this.budgets.filter((budget) => budget.ownerId === ownerId).map((row) => ({ ...row }))
  }

  async findByCategoryQuery(ownerId: string, categoryId: string): Promise<BudgetDTO | null> {
    const row = this.budgets.find(
      (budget) => budget.ownerId === ownerId && budget.categoryId === categoryId,
    )
    return row ? { ...row } : null
  }

  private toRow(budget: Budget): BudgetRow {
    return {
      id: budget.id.value,
      ownerId: budget.ownerId,
      categoryId: budget.categoryId,
      amount: budget.amount.cents,
    }
  }
}
