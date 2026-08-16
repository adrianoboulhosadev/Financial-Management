import { UseCase, NotFoundError, ConflictError, Errors } from 'shared'
import { Category } from '../model'
import { CategoryRepository } from '../providers'

interface Input {
  ownerId: string
  name: string
  parentId?: string | null
}

/**
 * Creates a node in the caller's own tree. If a parent is given it must exist
 * AND belong to the same user — someone else's node answers as missing, so the
 * tree cannot be probed from the outside. The name must be unique among its
 * siblings (same owner, same parent).
 */
export default class CreateCategory implements UseCase<Input, void> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({ ownerId, name, parentId }: Input): Promise<void> {
    const parent = parentId ?? null

    if (parent) {
      const parentCategory = await this.categoryRepository.findById(parent)
      if (!parentCategory || !parentCategory.belongsTo(ownerId)) {
        NotFoundError.throwError(Errors.CATEGORY_NOT_FOUND, parent)
      }
    }

    const category = new Category({ ownerId, name, parentId: parent })

    if (await this.categoryRepository.existsByNameAndParent(ownerId, category.name, parent)) {
      ConflictError.throwError(Errors.CATEGORY_ALREADY_EXISTS, category.name)
    }

    await this.categoryRepository.create(category)
  }
}
