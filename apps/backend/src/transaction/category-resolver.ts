import { CategoryFacade } from '@category/adapters'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'

/**
 * The cross-context question every write asks: "is this category mine, and is
 * it a leaf?". Lives in the APP layer because it is the only layer allowed to
 * talk to two contexts — the answer then travels into the use case as plain
 * data (`categoryIsLeaf`), exactly like any other resolved fact.
 *
 * Shared by the movement and the fixed-movement controllers, which ask it in
 * the same shape and would otherwise each grow their own copy.
 */
export class CategoryResolver {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  /**
   * `undefined` when no category was given at all (a one-off income) — the use
   * case then has nothing to check. A category that does not exist or belongs
   * to someone else throws CATEGORY_NOT_FOUND from the query itself.
   */
  async isLeafOf(categoryId: string | null | undefined, ownerId: string): Promise<boolean | undefined> {
    if (!categoryId) return undefined
    const facade = new CategoryFacade(undefined, this.categoryRepository)
    const category = await facade.findMyCategory(categoryId, ownerId)
    return category.isLeaf
  }
}
