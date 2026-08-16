import { UpdateCategory, CategoryRepository } from '@category/core'
import { UpdateCategoryInput } from '../@types'

export default class UpdateCategoryController {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string, input: UpdateCategoryInput, ownerId: string): Promise<void> {
    const useCase = new UpdateCategory(this.categoryRepository)
    await useCase.execute({ ownerId, categoryId, name: input.name })
  }
}
