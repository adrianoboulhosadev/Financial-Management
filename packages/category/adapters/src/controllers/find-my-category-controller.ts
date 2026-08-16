import { FindMyCategoryQuery, CategoryQueryRepository, CategoryDTO } from '@category/core'

export default class FindMyCategoryController {
  constructor(private readonly categoryQueryRepository: CategoryQueryRepository) {}

  async execute(categoryId: string, ownerId: string): Promise<CategoryDTO> {
    return new FindMyCategoryQuery(this.categoryQueryRepository).execute({ ownerId, categoryId })
  }
}
