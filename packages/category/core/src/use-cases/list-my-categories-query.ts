import { UseCase } from 'shared'
import { CategoryDTO } from '../model'
import { CategoryQueryRepository } from '../providers'

/** Read side (CQRS): the caller's whole tree, flat (each node with parentId +
 * isLeaf). Scoped by the authenticated id the HTTP boundary resolves. */
export default class ListMyCategoriesQuery implements UseCase<string, CategoryDTO[]> {
  constructor(private readonly categoryQueryRepository: CategoryQueryRepository) {}

  async execute(ownerId: string): Promise<CategoryDTO[]> {
    return this.categoryQueryRepository.listByOwnerQuery(ownerId)
  }
}
