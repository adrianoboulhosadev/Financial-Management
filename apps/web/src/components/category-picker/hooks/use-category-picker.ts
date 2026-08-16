'use client'

import { useMemo } from 'react'
import { useCategories } from '@/hooks/use-categories'

/**
 * The choosable options: only LEAVES, each labelled by its full path
 * ("casa / contas / luz"). A branch is never offered because money is always
 * filed on a leaf — the same rule the backend enforces, made unclickable here
 * so nobody discovers it as an error message.
 */
export function useCategoryPicker() {
  const { categories, loading, pathOf } = useCategories()

  const options = useMemo(
    () =>
      categories
        .filter((category) => category.isLeaf)
        .map((category) => ({ id: category.id, label: pathOf(category.id) }))
        .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR')),
    // `pathOf` is rebuilt on every render of the shared hook; the list it reads
    // is what actually changes, so that is what this tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories],
  )

  return { options, loading, hasCategories: categories.length > 0 }
}
