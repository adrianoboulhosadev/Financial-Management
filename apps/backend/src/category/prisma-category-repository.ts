import { Injectable } from '@nestjs/common'
import { CategoryRepository, CategoryQueryRepository, Category, CategoryDTO } from '@category/adapters'
import { PrismaService } from '../db/prisma.service'

interface CategoryRow {
  id: string
  ownerId: string
  name: string
  parentId: string | null
}

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository, CategoryQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Reconstitutes the rich entity from a row (via its constructor), inline —
  // no generic toDomain/toDTO helper.
  private reconstitute(row: CategoryRow): Category {
    return new Category({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      parentId: row.parentId,
    })
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } })
    return row ? this.reconstitute(row) : null
  }

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        id: category.id.value,
        ownerId: category.ownerId,
        name: category.name,
        parentId: category.parentId,
      },
    })
  }

  async update(category: Category): Promise<void> {
    // Only the name ever changes — a node never moves in the tree.
    await this.prisma.category.update({
      where: { id: category.id.value },
      data: { name: category.name },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } })
  }

  async existsByNameAndParent(
    ownerId: string,
    name: string,
    parentId: string | null,
  ): Promise<boolean> {
    const found = await this.prisma.category.findFirst({
      where: { ownerId, name, parentId },
      select: { id: true },
    })
    return found !== null
  }

  async hasChildren(id: string): Promise<boolean> {
    const child = await this.prisma.category.findFirst({
      where: { parentId: id },
      select: { id: true },
    })
    return child !== null
  }

  /**
   * Read side (CQRS). `isLeaf` is derived, not stored: one query brings the
   * whole tree and the set of parents answers it for every node at once — the
   * alternative would be a child count per row.
   */
  async listByOwnerQuery(ownerId: string): Promise<CategoryDTO[]> {
    const rows = await this.prisma.category.findMany({
      where: { ownerId },
      orderBy: { name: 'asc' },
    })
    const parentIds = new Set(rows.map((row) => row.parentId).filter(Boolean))
    return rows.map((row) => ({
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      parentId: row.parentId,
      isLeaf: !parentIds.has(row.id),
    }))
  }

  async findByIdQuery(id: string): Promise<CategoryDTO | null> {
    const row = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } },
    })
    return row
      ? {
          id: row.id,
          ownerId: row.ownerId,
          name: row.name,
          parentId: row.parentId,
          isLeaf: row._count.children === 0,
        }
      : null
  }
}
