'use client'

import { formatPeriod } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { ScreenHeader } from '@/components/screen-header'
import { Select } from '@/components/select'
import { Sheet } from '@/components/sheet'
import { CategoriesIcon, PencilIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { useCategoriesPage } from './hooks/use-categories-page'

/**
 * The owner's own filing cabinet. Nested as deep as they like — "casa" holding
 * "contas" holding "luz" — and ANY node can receive money, branch or leaf: how
 * deep to file something is the owner's call, not a rule.
 *
 * The list is flat and ordered by what each category cost this month, because
 * that is the question being asked of it. The hierarchy still reads, in the
 * path on every row.
 */
export default function CategoriesPage() {
  const page = useCategoriesPage()

  return (
    <>
      <ScreenHeader
        title="Categorias"
        backHref="/more"
        bordered
        action={
          <button
            type="button"
            onClick={page.openComposer}
            aria-label="Nova categoria"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
        subtitle={
          <>
            {page.categories.length}{' '}
            {page.categories.length === 1 ? 'categoria' : 'categorias'} · {formatPeriod(page.period)}
          </>
        }
      />

      <div className="px-5 pb-8 pt-1">
        {page.loading ? (
          <Loading compact />
        ) : page.rows.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie a primeira — por exemplo Casa, e depois Luz dentro dela."
            action={<Button onClick={page.openComposer}>Criar categoria</Button>}
          />
        ) : (
          page.rows.map((row, index) => (
            <ListRow key={row.category.id} last={index === page.rows.length - 1}>
              <IconBadge tone={row.spentCents > 0 ? 'accent' : 'muted'}>
                <CategoriesIcon size={17} />
              </IconBadge>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px]">{row.label}</p>
                <p
                  className={`mt-[3px] truncate text-[11px] ${
                    row.usage?.status === 'exceeded'
                      ? 'text-negative'
                      : row.usage?.status === 'warning'
                        ? 'text-warning'
                        : 'text-neutral-600'
                  }`}
                >
                  {page.captionFor(row)}
                </p>
              </div>

              {row.spentCents > 0 ? (
                <Amount cents={row.spentCents} className="flex-none text-[13px]" />
              ) : (
                <span className="flex-none text-[13px] text-neutral-600">—</span>
              )}

              <button
                type="button"
                onClick={() => page.startRenaming(row.category)}
                aria-label={`Renomear ${row.category.name}`}
                className="flex-none text-neutral-700 transition-colors hover:text-ink-text"
              >
                <PencilIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => page.askToDelete(row.category)}
                aria-label={`Excluir ${row.category.name}`}
                className="flex-none text-neutral-700 transition-colors hover:text-negative"
              >
                <TrashIcon size={16} />
              </button>
            </ListRow>
          ))
        )}
      </div>

      <Sheet open={page.composing} title="Nova categoria" onClose={page.closeComposer}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.name.trim()) page.create()
          }}
          className="flex flex-col gap-4"
        >
          <Field
            label="Nome"
            placeholder="Casa, Lazer, Mercado…"
            value={page.name}
            onChange={(event) => page.setName(event.target.value)}
          />

          <Select
            label="Dentro de"
            value={page.parentId}
            onChange={(event) => page.setParentId(event.target.value)}
          >
            <option value="">Nenhuma (categoria principal)</option>
            {page.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {page.pathOf(category.id)}
              </option>
            ))}
          </Select>

          <Button type="submit" className="w-full" disabled={page.creating || !page.name.trim()}>
            {page.creating ? 'Criando…' : 'Criar'}
          </Button>
        </form>
      </Sheet>

      <Sheet
        open={page.renaming !== null}
        title="Renomear categoria"
        onClose={page.cancelRenaming}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            page.confirmRenaming()
          }}
          className="flex flex-col gap-4"
        >
          <Field
            label="Nome"
            autoFocus
            value={page.draftName}
            onChange={(event) => page.setDraftName(event.target.value)}
          />
          <Button type="submit" className="w-full" disabled={!page.draftName.trim()}>
            Salvar
          </Button>
        </form>
      </Sheet>

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
    </>
  )
}
