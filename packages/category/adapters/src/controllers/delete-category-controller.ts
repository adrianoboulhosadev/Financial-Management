import { DeleteCategory, CategoryRepository } from '@category/core'

export default class DeleteCategoryController {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  // `inUse` is resolved by the app layer (it is the one allowed to look at the
  // other contexts) and travels in as plain data.
  async execute(categoryId: string, ownerId: string, inUse: boolean): Promise<void> {
    const useCase = new DeleteCategory(this.categoryRepository)
    await useCase.execute({ ownerId, categoryId, inUse })
  }
}
