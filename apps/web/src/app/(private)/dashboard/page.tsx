'use client'

import Link from 'next/link'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { StatCard } from '@/components/stat-card'
import { formatBRL } from 'ui'
import { useDashboard } from './hooks/use-dashboard'

export default function DashboardPage() {
  const { period, setPeriod, report, loading, labelFor } = useDashboard()

  if (loading || !report) return <Loading />

  const incomeCents = report.plannedIncomeCents + report.realizedIncomeCents
  const biggest = report.byCategory.slice(0, 6)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker period={period} onChange={setPeriod} />
        <Link
          href="/transactions"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink-bg hover:bg-accent/90"
        >
          Novo lançamento
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Entrou"
          accent="positive"
          value={<Amount cents={incomeCents} tone="income" />}
          hint={
            report.realizedIncomeCents > 0
              ? `${formatBRL(report.plannedIncomeCents)} de renda fixa + ${formatBRL(report.realizedIncomeCents)} avulso`
              : 'renda fixa cadastrada'
          }
        />
        <StatCard
          label="Saiu"
          accent="negative"
          value={<Amount cents={report.expenseCents} tone="expense" />}
          hint="despesas lançadas no mês"
        />
        <StatCard
          label="Sobra"
          accent="accent"
          value={<Amount cents={report.leftoverCents} tone="movement" />}
          hint={report.leftoverCents < 0 ? 'o mês fechou no vermelho' : 'o que ainda está livre'}
        />
      </section>

      <section className="rounded-card border border-ink-border bg-ink-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Orçamentos do mês</h2>

        {report.budgets.length === 0 ? (
          <p className="mt-3 text-sm text-ink-text-soft">
            Nenhum teto definido ainda.{' '}
            <Link href="/budgets" className="hover:underline">
              Definir um orçamento
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {report.budgets.map((usage) => (
              <li key={usage.budgetId} className="space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink-text-soft">{labelFor(usage.categoryId)}</span>
                  <span className="text-ink-text-muted">
                    <Amount cents={usage.spentCents} /> de {formatBRL(usage.limitCents)}
                    {usage.remainingCents < 0 && (
                      <span className="ml-2 text-negative">
                        ({formatBRL(-usage.remainingCents)} acima)
                      </span>
                    )}
                  </span>
                </div>
                <BudgetBar percentage={usage.percentage} status={usage.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-ink-border bg-ink-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Para onde foi</h2>

        {biggest.length === 0 ? (
          <EmptyState
            title="Nenhuma despesa neste mês"
            description="Assim que você lançar um gasto, ele aparece aqui separado por categoria."
          />
        ) : (
          <ul className="mt-4 space-y-2.5">
            {biggest.map((total) => (
              <li key={total.categoryId ?? 'none'} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-ink-text-soft">{labelFor(total.categoryId)}</span>
                  <Amount cents={total.spentCents} />
                </div>
                {/* Share of the month's spending, so the list reads as a
                    ranking and not just as numbers. */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent/70"
                    style={{
                      width: `${report.expenseCents === 0 ? 0 : Math.round((total.spentCents / report.expenseCents) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
