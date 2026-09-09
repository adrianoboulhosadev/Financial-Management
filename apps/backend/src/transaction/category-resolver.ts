import { CategoryFacade } from '@category/adapters'
import { PrismaCategoryRepository } from '../category/prisma-category-repository'

/**
 * The cross-context check every write makes: is this category MINE? Lives in
 * the APP layer because it is the only layer allowed to talk to two contexts —
 * `transaction` and `budget` never import `category`.
 *
 * It answers nothing back, and that is the whole change from what it used to
 * be: money may now be filed on ANY node of the tree, branch or leaf, because
 * how deep to file is the owner's call. What is left is the ownership check,
 * and a category belonging to somebody else throws CATEGORY_NOT_FOUND from the
 * query itself (anti-IDOR).
 *
 * Shared by the movement, fixed-movement and budget controllers, which ask it
 * in the same shape and would otherwise each grow their own copy.
 */
export class CategoryResolver {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  /** No category given at all (a one-off income) means there is nothing to
   * check. */
  async ensureOwned(categoryId: string | null | undefined, ownerId: string): Promise<void> {
    if (!categoryId) return
    const facade = new CategoryFacade(undefined, this.categoryRepository)
    await facade.findMyCategory(categoryId, ownerId)
  }
}
