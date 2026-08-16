import { CategoryRepository, CategoryQueryRepository, Category, CategoryDTO } from '../../src'

interface CategoryRow {
  id: string
  ownerId: string
  name: string
  parentId: string | null
}

export default class CategoryRepositoryInMemory
  implements CategoryRepository, CategoryQueryRepository
{
  readonly categories: CategoryRow[] = []

  async findById(id: string): Promise<Category | null> {
    const row = this.categories.find((category) => category.id === id)
    return row ? new Category(row) : null
  }

  async create(category: Category): Promise<void> {
    this.categories.push({
      id: category.id.value,
      ownerId: category.ownerId,
      name: category.name,
      parentId: category.parentId,
    })
  }

  async update(category: Category): Promise<void> {
    const row = this.categories.find((current) => current.id === category.id.value)
    if (row) row.name = category.name
  }

  async delete(id: string): Promise<void> {
    const index = this.categories.findIndex((category) => category.id === id)
    if (index >= 0) this.categories.splice(index, 1)
  }

  async existsByNameAndParent(
    ownerId: string,
    name: string,
    parentId: string | null,
  ): Promise<boolean> {
    return this.categories.some(
      (category) =>
        category.ownerId === ownerId && category.name === name && category.parentId === parentId,
    )
  }

  async hasChildren(id: string): Promise<boolean> {
    return this.categories.some((category) => category.parentId === id)
  }

  async listByOwnerQuery(ownerId: string): Promise<CategoryDTO[]> {
    return this.categories
      .filter((category) => category.ownerId === ownerId)
      .map((row) => this.toDTO(row))
  }

  async findByIdQuery(id: string): Promise<CategoryDTO | null> {
    const row = this.categories.find((category) => category.id === id)
    return row ? this.toDTO(row) : null
  }

  private toDTO(row: CategoryRow): CategoryDTO {
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      parentId: row.parentId,
      isLeaf: !this.categories.some((category) => category.parentId === row.id),
    }
  }
}
