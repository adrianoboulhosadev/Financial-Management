'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoryDTO } from '@category/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { clientConfig } from '../config'

export const CATEGORIES_KEY = ['categories']

/**
 * The user's category tree (flat list) plus the writes. Exposes helpers to walk
 * it: children of a node and the "a / b / c" path of a node — both apps render
 * the same hierarchy and label categories the same way.
 */
export function useCategories() {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()

  const query = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async (): Promise<CategoryDTO[]> =>
      (await api().get<CategoryDTO[]>('/category')).data,
  })

  const categories = useMemo(() => query.data ?? [], [query.data])
  const byId = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })

  const create = useMutation({
    mutationFn: async (input: { name: string; parentId: string | null }) => {
      await api().post('/category', input)
    },
    onSuccess: () => {
      notifier.success('Categoria criada.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível criar a categoria.')),
  })

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api().patch(`/category/${id}`, { name })
    },
    onSuccess: () => {
      notifier.success('Categoria renomeada.')
      invalidate()
    },
    onError: (error) =>
      notifier.error(errorMessage(error, 'Não foi possível renomear a categoria.')),
  })

  const remove = useMutation({
    mutationFn: async (categoryId: string) => {
      await api().delete(`/category/${categoryId}`)
    },
    onSuccess: () => {
      notifier.success('Categoria excluída.')
      invalidate()
    },
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível excluir a categoria.')),
  })

  return {
    categories,
    byId,
    loading: query.isLoading,
    childrenOf: (parentId: string | null) =>
      categories.filter((category) => category.parentId === parentId),
    pathOf: (id: string | null): string => {
      const names: string[] = []
      let current = id ? byId.get(id) : undefined
      while (current) {
        names.unshift(current.name)
        current = current.parentId ? byId.get(current.parentId) : undefined
      }
      return names.join(' / ')
    },
    /** Only LEAVES can receive money, so this is what every picker offers. */
    leaves: useMemo(() => categories.filter((category) => category.isLeaf), [categories]),
    create: create.mutate,
    creating: create.isPending,
    rename: (id: string, name: string) => rename.mutate({ id, name }),
    remove: remove.mutate,
  }
}
