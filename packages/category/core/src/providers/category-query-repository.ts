import { CategoryDTO } from '../model'

/** Category READ port. `listByOwnerQuery` returns that user's whole tree flat
 * (each node with its parentId + isLeaf) so the front can render/drill down the
 * hierarchy in one request. */
export interface CategoryQueryRepository {
  listByOwnerQuery(ownerId: string): Promise<CategoryDTO[]>
  findByIdQuery(id: string): Promise<CategoryDTO | null>
}
