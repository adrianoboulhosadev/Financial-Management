import { Category } from '../model'

/**
 * Category WRITE port (command side). Dedup uses `existsByNameAndParent`
 * (boolean, no fetch-and-map) and is scoped to the OWNER — the same name under
 * the same parent is only a clash inside one person's tree. `hasChildren`
 * guards deletion.
 */
export interface CategoryRepository {
  findById(id: string): Promise<Category | null>
  create(category: Category): Promise<void>
  update(category: Category): Promise<void>
  delete(id: string): Promise<void>
  existsByNameAndParent(ownerId: string, name: string, parentId: string | null): Promise<boolean>
  hasChildren(id: string): Promise<boolean>
}
