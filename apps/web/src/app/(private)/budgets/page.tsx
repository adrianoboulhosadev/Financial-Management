'use client'

import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { formatBRL } from '@/lib/money'
import { useBudgets } from './hooks/use-budgets'

export default function BudgetsPage() {
  const page = useBudgets()

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <MonthPicker period={page.period} onChange={page.setPeriod} />

        {page.loading ? (
          <Loading compact />
        ) : page.usages.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento definido"
            description="Escolha uma categoria ao lado e diga quanto você quer gastar por mês nela."
          />
        ) : (
          <ul className="space-y-3">
            {page.usages.map((usage) => (
              <li
                key={usage.budgetId}
                className="space-y-2.5 rounded-card border border-ink-border bg-ink-surface p-4 shadow-card"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{page.labelFor(usage.categoryId)}</span>
                  <button
                    type="button"
                    onClick={() => page.askToDelete(usage)}
                    className="text-xs text-ink-text-muted transition-colors hover:text-negative"
                  >
                    Remover
                  </button>
                </div>

                <BudgetBar percentage={usage.percentage} status={usage.status} />

                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-text-muted">
                  <span>
                    <Amount cents={usage.spentCents} className="text-xs" /> de{' '}
                    {formatBRL(usage.limitCents)} · {usage.percentage}%
                  </span>
                  <span>
                    {usage.remainingCents >= 0 ? (
                      <>Restam {formatBRL(usage.remainingCents)}</>
                    ) : (
                      <span className="text-negative">
                        {formatBRL(-usage.remainingCents)} acima do teto
                      </span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.categoryId && page.amount) page.save()
          }}
          className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
        >
          <h2 className="text-sm font-semibold">Definir orçamento</h2>
          <p className="text-xs leading-relaxed text-ink-text-soft">
            O teto vale para todo mês. Definir de novo a mesma categoria ajusta o valor.
          </p>

          <CategoryPicker value={page.categoryId} onChange={page.setCategoryId} />

          <Field
            label="Teto mensal (R$)"
            money
            placeholder="500,00"
            value={page.amount}
            onChange={(event) => page.setAmount(event.target.value)}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={page.saving || !page.categoryId || !page.amount}
          >
            {page.saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      </aside>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Remover orçamento"
        description="A categoria continua existindo — ela só deixa de ser acompanhada."
        confirmLabel="Remover"
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </div>
  )
}
