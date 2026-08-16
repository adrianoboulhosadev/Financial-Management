import { CreateCategory, CategoryRepository } from '@category/core'
import { CreateCategoryInput } from '../@types'

export default class CreateCategoryController {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  // ownerId comes from the JWT (HTTP boundary), never from the request body.
  async execute(input: CreateCategoryInput, ownerId: string): Promise<void> {
    const useCase = new CreateCategory(this.categoryRepository)
    await useCase.execute({ ownerId, name: input.name, parentId: input.parentId })
  }
}
