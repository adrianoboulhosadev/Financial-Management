import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { CategoryRepository } from '../providers'

interface Input {
  ownerId: string
  categoryId: string
  name: string
}

/**
 * Renames a node. Only the name changes (a node never moves in the tree). The
 * new name must stay unique among its siblings.
 */
export default class UpdateCategory implements UseCase<Input, void> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({ ownerId, categoryId, name }: Input): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId)
    if (!category || !category.belongsTo(ownerId)) {
      NotFoundError.throwError(Errors.CATEGORY_NOT_FOUND, categoryId)
    }

    category.rename(name)

    // The node still carries its OLD name in storage, so a hit here is a real
    // sibling clash (never the node itself).
    const clash = await this.categoryRepository.existsByNameAndParent(
      ownerId,
      category.name,
      category.parentId,
    )
    if (clash) ConflictError.throwError(Errors.CATEGORY_ALREADY_EXISTS, category.name)

    await this.categoryRepository.update(category)
  }
}
