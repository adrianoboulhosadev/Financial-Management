import { useMemo, useState } from 'react'
import { useCategories } from 'ui'

/**
 * The choosable options: only LEAVES, each labelled by its full path
 * ("casa / contas / luz"). A branch is never offered because money is always
 * filed on a leaf — the same rule the backend enforces, made untappable here so
 * nobody discovers it as an error message.
 */
export function useCategoryPicker() {
  const { leaves, loading, pathOf } = useCategories()
  const [open, setOpen] = useState(false)

  const options = useMemo(
    () =>
      leaves
        .map((category) => ({ id: category.id, label: pathOf(category.id) }))
        .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leaves],
  )

  return {
    options,
    loading,
    open,
    toggle: () => setOpen((current) => !current),
    close: () => setOpen(false),
    labelOf: (id: string) => options.find((option) => option.id === id)?.label ?? '',
  }
}
