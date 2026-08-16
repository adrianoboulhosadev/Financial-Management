'use client'

import Link from 'next/link'
import { useCategoryPicker } from './hooks/use-category-picker'

interface CategoryPickerProps {
  label?: string
  value: string
  onChange: (categoryId: string) => void
  /** An income may have no category at all, so the empty option is allowed
   * there and refused on an expense. */
  allowEmpty?: boolean
  error?: string
}

export function CategoryPicker({
  label = 'Categoria',
  value,
  onChange,
  allowEmpty = false,
  error,
}: CategoryPickerProps) {
  const { options, loading, hasCategories } = useCategoryPicker()

  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !hasCategories}
        className="w-full rounded-lg border border-ink-border bg-ink-bg px-3 py-2.5 text-ink-text outline-none transition-colors focus:border-accent disabled:opacity-60"
      >
        <option value="">{allowEmpty ? 'Sem categoria' : 'Selecione…'}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      {/* A tree with only branches (or none at all) leaves nothing to pick, and
          an empty dropdown explains nothing — point at where to fix it. */}
      {!loading && options.length === 0 && (
        <span className="block text-sm text-ink-text-muted">
          Você ainda não tem uma categoria final.{' '}
          <Link href="/categories" className="text-accent hover:underline">
            Criar categoria
          </Link>
        </span>
      )}
      {error && <span className="block text-sm text-negative">{error}</span>}
    </label>
  )
}
