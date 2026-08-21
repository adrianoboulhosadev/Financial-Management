'use client'

import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { formatDate } from '@/lib/date'
import { TRANSACTION_TYPES } from '@/data/transaction-types'
import { useRecurrences } from './hooks/use-recurrences'

export default function RecurrencesPage() {
  const page = useRecurrences()

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <p className="text-sm text-ink-text-soft">
          O que se repete todo mês — aluguel, assinatura, mensalidade. Na data marcada o lançamento
          entra sozinho e você recebe um aviso.
        </p>

        {page.loading ? (
          <Loading compact />
        ) : page.recurrences.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento fixo"
            description="Cadastre ao lado o que se repete todo mês e pare de lançar na mão."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.recurrences.map((recurrence) => (
              <li key={recurrence.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${recurrence.active ? '' : 'text-ink-text-muted line-through'}`}
                  >
                    {recurrence.description}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-text-muted">
                    todo dia {recurrence.dayOfMonth} · {page.labelFor(recurrence.categoryId)}
                    {recurrence.active
                      ? ` · próximo em ${formatDate(recurrence.nextRunAt)}`
                      : ' · pausado'}
                  </p>
                </div>

                <Amount
                  cents={recurrence.amount}
                  tone={recurrence.type === 'expense' ? 'expense' : 'income'}
                  signed
                  className="text-sm"
                />

                <button
                  type="button"
                  onClick={() => page.toggleActive(recurrence)}
                  className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                >
                  {recurrence.active ? 'Pausar' : 'Retomar'}
                </button>
                <button
                  type="button"
                  onClick={() => page.askToDelete(recurrence)}
                  aria-label={`Excluir ${recurrence.description}`}
                  className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.description.trim() && page.amount) page.create()
          }}
          className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
        >
          <h2 className="text-sm font-semibold">Novo lançamento fixo</h2>

          <div className="inline-flex rounded-lg border border-ink-border p-1">
            {TRANSACTION_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => page.setType(option.value)}
                className={`rounded px-4 py-1.5 text-sm transition-colors ${
                  page.type === option.value
                    ? option.value === 'expense'
                      ? 'bg-negative/15 text-negative'
                      : 'bg-positive/15 text-positive'
                    : 'text-ink-text-muted hover:text-ink-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Field
            label="Descrição"
            placeholder="Aluguel, streaming…"
            value={page.description}
            onChange={(event) => page.setDescription(event.target.value)}
          />
          <Field
            label="Valor (R$)"
            money
            placeholder="0,00"
            value={page.amount}
            onChange={(event) => page.setAmount(event.target.value)}
          />
          <Field
            label="Dia do mês"
            type="number"
            min={1}
            max={31}
            value={page.dayOfMonth}
            onChange={(event) => page.setDayOfMonth(event.target.value)}
          />
          <CategoryPicker
            value={page.categoryId}
            onChange={page.setCategoryId}
            allowEmpty={!page.categoryRequired}
          />

          {/* Day 31 does not exist every month; the domain clamps it instead of
              skipping or rolling over, and saying so here avoids the surprise. */}
          {Number(page.dayOfMonth) > 28 && (
            <p className="text-xs text-ink-text-muted">
              Em meses mais curtos, o lançamento entra no último dia do mês.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              page.creating ||
              !page.description.trim() ||
              !page.amount ||
              (page.categoryRequired && !page.categoryId)
            }
          >
            {page.creating ? 'Criando…' : 'Criar'}
          </Button>
        </form>
      </aside>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir lançamento fixo"
        description="Os lançamentos que ele já criou continuam no histórico — só para de gerar novos."
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </div>
  )
}
