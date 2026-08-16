import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { CategoryRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  /**
   * Whether any transaction/budget still points at this node. Resolved by the
   * APP layer (the backend queries the other contexts) and handed in as plain
   * data — `category` never imports `transaction` or `budget`, same rule the
   * leaf check follows in the other direction.
   */
  inUse: boolean
}

/**
 * Deletes a node of the caller's tree. Refused when it still has children
 * (delete the leaves first) or when something already references it — a spent
 * amount must never lose the category it was filed under.
 */
export default class DeleteCategory implements UseCase<Input, void> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({ ownerId, categoryId, inUse }: Input): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId)
    if (!category || !category.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CATEGORY_NOT_FOUND, categoryId)
    }

    if (await this.categoryRepository.hasChildren(categoryId)) {
      ConflictError.throwError(Errors.CATEGORY_HAS_CHILDREN, categoryId)
    }
    if (inUse) ConflictError.throwError(Errors.CATEGORY_IN_USE, categoryId)

    await this.categoryRepository.delete(categoryId)
  }
}
