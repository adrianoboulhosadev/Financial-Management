import { useState } from 'react'
import { useCategories } from 'ui'

/**
 * The choosable options: the WHOLE tree, each labelled by its full path
 * ("casa / contas / luz"). A branch is offered just like a leaf — filing the
 * wifi bill under "casa" or under "casa / internet" is the owner's call, not
 * the form's — plus the sheet's own open/closed state, which is the phone's
 * answer to a `<select>`.
 */
export function useCategoryPicker() {
  const { options, loading } = useCategories()
  const [open, setOpen] = useState(false)

  return {
    options,
    loading,
    open,
    toggle: () => setOpen((current) => !current),
    close: () => setOpen(false),
    labelOf: (id: string) => options.find((option) => option.id === id)?.label ?? '',
  }
}
