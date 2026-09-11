'use client'

import { useState } from 'react'
import type { CategoryDTO } from '@category/adapters'
import { caption, formatBRL, toPeriod, useBudgets, useCategories, useMonthlyReport } from 'ui'

export function useCategoriesPage() {
  const tree = useCategories()
  const period = toPeriod()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<CategoryDTO | null>(null)
  const [composing, setComposing] = useState(false)
  const [renaming, setRenaming] = useState<CategoryDTO | null>(null)
  const [draftName, setDraftName] = useState('')

  // A category is only interesting next to what went through it, so the screen
  // reads the month alongside the tree: what was spent, and whether there is a
  // ceiling on it.
  const { report } = useMonthlyReport(period)
  const { usages } = useBudgets(period)

  const spentBy = new Map(
    (report?.byCategory ?? [])
      .filter((total) => total.categoryId !== null)
      .map((total) => [total.categoryId as string, total.spentCents]),
  )
  const usageBy = new Map(usages.map((usage) => [usage.categoryId, usage]))

  return {
    categories: tree.categories,
    loading: tree.loading,
    period,
    /**
     * Every category as ONE flat list, each labelled by its full path and
     * ordered by what it cost this month.
     *
     * Flat and not indented on purpose: the path ("casa / contas / luz") says
     * everything the indentation would, and it lets the list be sorted by the
     * figure that actually matters. An indented tree can only ever be sorted by
     * its own shape.
     */
    rows: tree.categories
      .map((category) => ({
        category,
        label: tree.pathOf(category.id),
        spentCents: spentBy.get(category.id) ?? 0,
        usage: usageBy.get(category.id),
      }))
      .sort((a, b) => b.spentCents - a.spentCents || a.label.localeCompare(b.label)),
    childrenOf: tree.childrenOf,
    pathOf: tree.pathOf,
    name,
    setName,
    parentId,
    setParentId,
    composing,
    openComposer: () => setComposing(true),
    closeComposer: () => setComposing(false),
    create: () => {
      tree.create({ name, parentId: parentId || null })
      setName('')
      setParentId('')
      setComposing(false)
    },
    creating: tree.creating,
    renaming,
    draftName,
    setDraftName,
    startRenaming: (category: CategoryDTO) => {
      setRenaming(category)
      setDraftName(category.name)
    },
    cancelRenaming: () => setRenaming(null),
    confirmRenaming: () => {
      if (!renaming || !draftName.trim()) return
      if (draftName.trim() !== renaming.name) tree.rename(renaming.id, draftName.trim())
      setRenaming(null)
    },
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      tree.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    /** The line under a category: how much of its ceiling is gone, or simply
     * that it has none. A branch that only groups others says so, because a
     * grouping node with no movements of its own is not an empty category. */
    captionFor: (row: {
      category: CategoryDTO
      spentCents: number
      usage?: { limitCents: number; percentage: number }
    }) =>
      caption(
        row.usage
          ? `teto ${formatBRL(row.usage.limitCents)} · ${row.usage.percentage}% usado`
          : row.spentCents > 0
            ? 'sem teto'
            : 'sem lançamentos neste mês',
        !row.category.isLeaf && 'agrupa outras',
      ),
  }
}
