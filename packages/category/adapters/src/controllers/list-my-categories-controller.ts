import { ListMyCategoriesQuery, CategoryQueryRepository, CategoryDTO } from '@category/core'

export default class ListMyCategoriesController {
  constructor(private readonly categoryQueryRepository: CategoryQueryRepository) {}

  async execute(ownerId: string): Promise<CategoryDTO[]> {
    return new ListMyCategoriesQuery(this.categoryQueryRepository).execute(ownerId)
  }
}
