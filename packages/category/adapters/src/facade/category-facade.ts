import { CategoryRepository, CategoryQueryRepository, CategoryDTO } from '@category/core'
import {
  CreateCategoryController,
  UpdateCategoryController,
  DeleteCategoryController,
  ListMyCategoriesController,
  FindMyCategoryController,
} from '../controllers'
import { CreateCategoryInput, UpdateCategoryInput } from '../@types'

/**
 * Single entry point the backend (NestJS) calls. Optional ports in the
 * constructor; each method builds its controller. `ownerId` is always the
 * authenticated id resolved from the JWT — the tree is private to its owner.
 */
export default class CategoryFacade {
  constructor(
    private readonly categoryRepository?: CategoryRepository,
    private readonly categoryQueryRepository?: CategoryQueryRepository,
  ) {}

  async createCategory(input: CreateCategoryInput, ownerId: string): Promise<void> {
    await new CreateCategoryController(this.categoryRepository!).execute(input, ownerId)
  }

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
    ownerId: string,
  ): Promise<void> {
    await new UpdateCategoryController(this.categoryRepository!).execute(categoryId, input, ownerId)
  }

  async deleteCategory(categoryId: string, ownerId: string, inUse: boolean): Promise<void> {
    await new DeleteCategoryController(this.categoryRepository!).execute(categoryId, ownerId, inUse)
  }

  async listMyCategories(ownerId: string): Promise<CategoryDTO[]> {
    return new ListMyCategoriesController(this.categoryQueryRepository!).execute(ownerId)
  }

  async findMyCategory(categoryId: string, ownerId: string): Promise<CategoryDTO> {
    return new FindMyCategoryController(this.categoryQueryRepository!).execute(categoryId, ownerId)
  }
}
