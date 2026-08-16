'use client'

import type { CategoryDTO } from '@category/adapters'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { useCategoriesPage } from './hooks/use-categories-page'

export default function CategoriesPage() {
  const page = useCategoriesPage()

  // Declared here rather than as a sibling component: it recurses over the tree
  // and reads the page's own handlers, so pulling it out would only move the
  // same props one file away.
  const renderNode = (category: CategoryDTO, depth: number) => (
    <li key={category.id}>
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        <span className="min-w-0 flex-1 truncate text-sm">
          {category.name}
          {!category.isLeaf && (
            // Only a leaf can receive money, so saying which nodes merely group
            // others saves a failed attempt later.
            <span className="ml-2 text-xs text-ink-text-muted">agrupa</span>
          )}
        </span>

        <button
          type="button"
          onClick={() => {
            const newName = window.prompt('Novo nome da categoria', category.name)
            if (newName && newName.trim() !== category.name) page.rename(category.id, newName.trim())
          }}
          className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
        >
          Renomear
        </button>
        <button
          type="button"
          onClick={() => page.askToDelete(category)}
          aria-label={`Excluir ${category.name}`}
          className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
        >
          ✕
        </button>
      </div>

      {page.childrenOf(category.id).length > 0 && (
        <ul>{page.childrenOf(category.id).map((child) => renderNode(child, depth + 1))}</ul>
      )}
    </li>
  )

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        {page.loading ? (
          <Loading compact />
        ) : page.roots.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie a primeira ao lado — por exemplo Casa, e depois Luz dentro dela."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.roots.map((category) => renderNode(category, 0))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.name.trim()) page.create()
          }}
          className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
        >
          <h2 className="text-sm font-semibold">Nova categoria</h2>

          <Field
            label="Nome"
            placeholder="Casa, Lazer, Mercado…"
            value={page.name}
            onChange={(event) => page.setName(event.target.value)}
          />

          <label className="block space-y-1.5">
            <span className="block text-xs font-medium uppercase tracking-wide text-ink-text-muted">
              Dentro de
            </span>
            <select
              value={page.parentId}
              onChange={(event) => page.setParentId(event.target.value)}
              className="w-full rounded-lg border border-ink-border bg-ink-bg px-3 py-2.5 text-ink-text outline-none focus:border-accent"
            >
              <option value="">Nenhuma (categoria principal)</option>
              {page.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {page.pathOf(category.id)}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" className="w-full" disabled={page.creating || !page.name.trim()}>
            {page.creating ? 'Criando…' : 'Criar'}
          </Button>
        </form>
      </aside>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir categoria"
        description={
          page.pendingDeletion
            ? `"${page.pendingDeletion.name}" será removida. Só é possível excluir uma categoria sem subcategorias e sem nada lançado nela.`
            : undefined
        }
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </div>
  )
}
