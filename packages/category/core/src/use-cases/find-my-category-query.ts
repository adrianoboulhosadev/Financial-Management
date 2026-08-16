import { UseCase, NotFoundError, Errors } from 'shared'
import { CategoryDTO } from '../model'
import { CategoryQueryRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
}

/**
 * Read side (CQRS) of a single node. This is what the APP layer calls to
 * resolve "does this category exist, is it mine, and is it a leaf?" before
 * letting a transaction or a budget point at it — the answer travels onward as
 * plain data, so no other context ever imports this one.
 */
export default class FindMyCategoryQuery implements UseCase<Input, CategoryDTO> {
  constructor(private readonly categoryQueryRepository: CategoryQueryRepository) {}

  async execute({ ownerId, categoryId }: Input): Promise<CategoryDTO> {
    const category = await this.categoryQueryRepository.findByIdQuery(categoryId)
    // Someone else's node is indistinguishable from a missing one (anti-IDOR).
    if (!category || category.ownerId !== ownerId) {
      NotFoundError.throwError(Errors.CATEGORY_NOT_FOUND, categoryId)
    }
    return category
  }
}
