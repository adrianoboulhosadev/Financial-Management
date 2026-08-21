import { useState } from 'react'
import type { CategoryDTO } from '@category/adapters'
import { useCategories } from 'ui'

export function useCategoriesScreen() {
  const tree = useCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CategoryDTO | null>(null)

  /** Flattened for rendering: a phone list cannot nest, so each node carries
   * its depth and is indented by it — the same tree, one level of indirection
   * fewer. */
  const flatten = (parent: string | null, depth = 0): { category: CategoryDTO; depth: number }[] =>
    tree
      .childrenOf(parent)
      .flatMap((category) => [{ category, depth }, ...flatten(category.id, depth + 1)])

  return {
    rows: flatten(null),
    categories: tree.categories,
    loading: tree.loading,
    pathOf: tree.pathOf,
    creating: tree.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    name,
    setName,
    parentId,
    setParentId,
    canSubmit: Boolean(name.trim()),
    submit: () => {
      tree.create({ name, parentId })
      setFormOpen(false)
      setName('')
      setParentId(null)
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      tree.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
  }
}
