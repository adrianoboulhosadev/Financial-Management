import {
  BudgetRepository,
  BudgetQueryRepository,
  BudgetDTO,
  BudgetUsageDTO,
  CategorySpent,
} from '@budget/core'
import {
  SetBudgetController,
  DeleteBudgetController,
  ListMyBudgetsController,
  GetMyBudgetUsageController,
  EvaluateBudgetAlertController,
} from '../controllers'
import { SetBudgetInput } from '../@types'

/**
 * Single entry point the apps (backend and worker) call. Optional ports in the
 * constructor; each method builds its controller. Whatever this context cannot
 * know by itself — whether a category is a leaf, how much was spent — arrives as
 * plain data the app layer resolved.
 */
export default class BudgetFacade {
  constructor(
    private readonly budgetRepository?: BudgetRepository,
    private readonly budgetQueryRepository?: BudgetQueryRepository,
  ) {}

  async setBudget(input: SetBudgetInput, ownerId: string, categoryIsLeaf?: boolean): Promise<void> {
    await new SetBudgetController(this.budgetRepository!).execute(input, ownerId, categoryIsLeaf)
  }

  async deleteBudget(budgetId: string, ownerId: string): Promise<void> {
    await new DeleteBudgetController(this.budgetRepository!).execute(budgetId, ownerId)
  }

  async listMyBudgets(ownerId: string): Promise<BudgetDTO[]> {
    return new ListMyBudgetsController(this.budgetQueryRepository!).execute(ownerId)
  }

  async getMyBudgetUsage(ownerId: string, spending: CategorySpent[]): Promise<BudgetUsageDTO[]> {
    return new GetMyBudgetUsageController(this.budgetQueryRepository!).execute(ownerId, spending)
  }

  /** System path (worker): is this spending worth telling the owner about? */
  async evaluateBudgetAlert(
    ownerId: string,
    categoryId: string,
    spentCents: number,
  ): Promise<BudgetUsageDTO | null> {
    return new EvaluateBudgetAlertController(this.budgetQueryRepository!).execute(
      ownerId,
      categoryId,
      spentCents,
    )
  }
}
