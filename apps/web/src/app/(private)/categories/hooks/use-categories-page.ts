'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CategoryDTO } from '@category/adapters'
import { api } from '@/lib/api'
import { notify } from '@/lib/notify'
import { CATEGORIES_KEY, useCategories } from '@/hooks/use-categories'

export function useCategoriesPage() {
  const queryClient = useQueryClient()
  const { categories, loading, childrenOf, pathOf } = useCategories()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<CategoryDTO | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/category', { name, parentId: parentId || null })
    },
    onSuccess: () => {
      notify.success('Categoria criada.')
      setName('')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível criar a categoria.'),
  })

  const remove = useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/category/${categoryId}`)
    },
    onSuccess: () => {
      notify.success('Categoria excluída.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível excluir a categoria.'),
  })

  const rename = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      await api.patch(`/category/${id}`, { name: newName })
    },
    onSuccess: () => {
      notify.success('Categoria renomeada.')
      invalidate()
    },
    onError: (error) => notify.failure(error, 'Não foi possível renomear a categoria.'),
  })

  return {
    categories,
    loading,
    // The tree is rendered from the roots down; each level asks for its own children.
    roots: childrenOf(null),
    childrenOf,
    pathOf,
    name,
    setName,
    parentId,
    setParentId,
    create: () => create.mutate(),
    creating: create.isPending,
    rename: (id: string, newName: string) => rename.mutate({ id, newName }),
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      remove.mutate(pendingDeletion.id)
      setPendingDeletion(null)
    },
  }
}
