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
    <label className="block">
      <span className="mb-[7px] block text-[9.5px] uppercase tracking-[0.16em] text-neutral-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !hasCategories}
        className="w-full rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3 text-[13.5px] text-ink-text outline-none transition-colors focus:border-accent-800 disabled:opacity-60"
      >
        <option value="">{allowEmpty ? 'Sem categoria' : 'Selecione…'}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      {/* An empty dropdown explains nothing — point at where to fix it. */}
      {!loading && options.length === 0 && (
        <span className="mt-1.5 block text-[10.5px] text-neutral-600">
          Você ainda não tem categorias.{' '}
          <Link href="/categories" className="text-accent-300 hover:underline">
            Criar categoria
          </Link>
        </span>
      )}
      {error && <span className="mt-1.5 block text-xs text-negative">{error}</span>}
    </label>
  )
}
