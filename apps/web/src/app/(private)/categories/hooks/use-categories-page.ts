'use client'

import { useState } from 'react'
import type { CategoryDTO } from '@category/adapters'
import { useCategories } from 'client'

export function useCategoriesPage() {
  const tree = useCategories()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<CategoryDTO | null>(null)

  return {
    categories: tree.categories,
    loading: tree.loading,
    // The tree is rendered from the roots down; each level asks for its own children.
    roots: tree.childrenOf(null),
    childrenOf: tree.childrenOf,
    pathOf: tree.pathOf,
    name,
    setName,
    parentId,
    setParentId,
    create: () => {
      tree.create({ name, parentId: parentId || null })
      setName('')
    },
    creating: tree.creating,
    rename: tree.rename,
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
