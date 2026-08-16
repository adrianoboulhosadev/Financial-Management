import { ValidationError, ConflictError, NotFoundError, Errors } from 'shared'
import {
  Category,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  ListMyCategoriesQuery,
  FindMyCategoryQuery,
} from '../src'
import { CategoryRepositoryInMemory } from './in-memory'

const owner = 'user-1'
const stranger = 'user-2'

test('Category requires an owner and a name', () => {
  expect(() => new Category({ ownerId: owner, name: '  ' })).toThrow(ValidationError)
  expect(() => new Category({ ownerId: ' ', name: 'Casa' })).toThrow(ValidationError)
})

test('builds a tree: casa -> contas -> luz', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'casa' })
  const casa = repository.categories[0].id
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'contas', parentId: casa })
  const contas = repository.categories[1].id
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'luz', parentId: contas })

  const all = await new ListMyCategoriesQuery(repository).execute(owner)
  expect(all).toHaveLength(3)
  const byName = (name: string) => all.find((category) => category.name === name)!
  // only the deepest node is a leaf; intermediate nodes are not
  expect(byName('casa').isLeaf).toBe(false)
  expect(byName('contas').isLeaf).toBe(false)
  expect(byName('luz').isLeaf).toBe(true)
})

test('each user only ever sees their own tree', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  await new CreateCategory(repository).execute({ ownerId: stranger, name: 'lazer' })

  expect(await new ListMyCategoriesQuery(repository).execute(owner)).toHaveLength(1)
  expect(await new ListMyCategoriesQuery(repository).execute(stranger)).toHaveLength(1)
})

test('the same name is only a clash inside the SAME tree', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })

  // Someone else's identical name is fine...
  await new CreateCategory(repository).execute({ ownerId: stranger, name: 'lazer' })
  // ...but a second "lazer" of my own is not.
  const duplicate = new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  await expect(duplicate).rejects.toBeInstanceOf(ConflictError)
  await expect(duplicate).rejects.toMatchObject({ code: Errors.CATEGORY_ALREADY_EXISTS })
})

test('the same name under different parents is allowed', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'casa' })
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'carro' })
  const casa = repository.categories[0].id
  const carro = repository.categories[1].id
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'seguro', parentId: casa })
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'seguro', parentId: carro })
  expect(repository.categories).toHaveLength(4)
})

test('creating under a missing parent fails (CATEGORY_NOT_FOUND)', async () => {
  const repository = new CategoryRepositoryInMemory()
  const create = new CreateCategory(repository).execute({
    ownerId: owner,
    name: 'x',
    parentId: 'ghost',
  })
  await expect(create).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_FOUND })
})

test("someone else's node answers as missing, never as forbidden (anti-IDOR)", async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: stranger, name: 'lazer' })
  const foreign = repository.categories[0].id

  // Hanging a child off it, renaming it, deleting it and reading it all answer
  // the same way: it does not exist as far as this user is concerned.
  const nest = new CreateCategory(repository).execute({
    ownerId: owner,
    name: 'cinema',
    parentId: foreign,
  })
  await expect(nest).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_FOUND })

  const rename = new UpdateCategory(repository).execute({
    ownerId: owner,
    categoryId: foreign,
    name: 'meu',
  })
  await expect(rename).rejects.toBeInstanceOf(NotFoundError)

  const remove = new DeleteCategory(repository).execute({
    ownerId: owner,
    categoryId: foreign,
    inUse: false,
  })
  await expect(remove).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_FOUND })

  const read = new FindMyCategoryQuery(repository).execute({
    ownerId: owner,
    categoryId: foreign,
  })
  await expect(read).rejects.toMatchObject({ code: Errors.CATEGORY_NOT_FOUND })
})

test('rename keeps uniqueness among siblings', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'casa' })
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  const lazer = repository.categories[1].id

  const clash = new UpdateCategory(repository).execute({
    ownerId: owner,
    categoryId: lazer,
    name: 'casa',
  })
  await expect(clash).rejects.toMatchObject({ code: Errors.CATEGORY_ALREADY_EXISTS })
})

test('renaming to the same name is not a clash with itself', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  const lazer = repository.categories[0].id

  await new UpdateCategory(repository).execute({
    ownerId: owner,
    categoryId: lazer,
    name: 'Lazer e cultura',
  })
  expect(repository.categories[0].name).toBe('Lazer e cultura')
})

test('cannot delete a node that has children (CATEGORY_HAS_CHILDREN)', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'casa' })
  const casa = repository.categories[0].id
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'luz', parentId: casa })

  const remove = new DeleteCategory(repository).execute({
    ownerId: owner,
    categoryId: casa,
    inUse: false,
  })
  await expect(remove).rejects.toBeInstanceOf(ConflictError)
  await expect(remove).rejects.toMatchObject({ code: Errors.CATEGORY_HAS_CHILDREN })
})

test('cannot delete a node something already points at (CATEGORY_IN_USE)', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  const lazer = repository.categories[0].id

  const remove = new DeleteCategory(repository).execute({
    ownerId: owner,
    categoryId: lazer,
    inUse: true,
  })
  await expect(remove).rejects.toMatchObject({ code: Errors.CATEGORY_IN_USE })
  expect(repository.categories).toHaveLength(1)
})

test('deleting an unused leaf works', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'lazer' })
  const lazer = repository.categories[0].id
  await new DeleteCategory(repository).execute({ ownerId: owner, categoryId: lazer, inUse: false })
  expect(repository.categories).toHaveLength(0)
})

test('FindMyCategoryQuery answers the leaf flag the other contexts rely on', async () => {
  const repository = new CategoryRepositoryInMemory()
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'casa' })
  const casa = repository.categories[0].id
  await new CreateCategory(repository).execute({ ownerId: owner, name: 'luz', parentId: casa })
  const luz = repository.categories[1].id

  const query = new FindMyCategoryQuery(repository)
  expect((await query.execute({ ownerId: owner, categoryId: casa })).isLeaf).toBe(false)
  expect((await query.execute({ ownerId: owner, categoryId: luz })).isLeaf).toBe(true)
})
