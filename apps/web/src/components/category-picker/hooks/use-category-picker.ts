'use client'

import { useCategories } from 'ui'

/**
 * The choosable options: the WHOLE tree, each node labelled by its full path
 * ("casa / contas / luz"). A branch is offered just like a leaf — filing the
 * wifi bill under "casa" or under "casa / internet" is the owner's call, not
 * the form's, and the backend accepts either.
 *
 * Nothing but a pass-through today, and it stays a hook because the picker's
 * JSX must not reach for a data hook itself.
 */
export function useCategoryPicker() {
  const { options, loading, categories } = useCategories()

  return { options, loading, hasCategories: categories.length > 0 }
}
