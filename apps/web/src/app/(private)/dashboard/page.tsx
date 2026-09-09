'use client'

import Link from 'next/link'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { CategoryBars } from '@/components/category-bars'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { MonthSplitBar } from '@/components/month-split-bar'
import { StatCard } from '@/components/stat-card'
import { formatBRL } from 'ui'
import { InvestLeftover } from './components/invest-leftover'
import { useDashboard } from './hooks/use-dashboard'

export default function DashboardPage() {
  const { period, setPeriod, report, loading, bars, fixedCents, pendingFixedCents, labelFor } =
    useDashboard()

  if (loading || !report) return <Loading />

  const incomeCents = report.plannedIncomeCents + report.realizedIncomeCents

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
          // The fixed bills of the month count here whether or not they have
          // been paid yet: money already promised is not money to spend.
          value={<Amount cents={report.totalExpenseCents} tone="expense" />}
          hint={
            report.committedExpenseCents > 0
              ? `inclui ${formatBRL(report.committedExpenseCents)} de fixos ainda não lançados`
              : 'despesas lançadas no mês'
          }
        />
        <StatCard
          label="Sobra"
          accent="accent"
          value={<Amount cents={report.leftoverCents} tone="movement" />}
          hint={
            report.leftoverCents < 0
              ? 'o mês fechou no vermelho'
              : report.investedCents > 0
                ? 'livre, já fora o que foi investido'
                : 'o que ainda está livre'
          }
        />
      </section>

      <section className="rounded-card border border-ink-border bg-ink-surface p-5 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Como o mês se divide</h2>
          {pendingFixedCents > 0 && (
            <Link href="/checklist" className="text-xs text-accent hover:underline">
              {formatBRL(pendingFixedCents)} de fixos a pagar
            </Link>
          )}
        </div>

        <div className="mt-4">
          <MonthSplitBar
            incomeCents={incomeCents}
            fixedCents={fixedCents}
            // What was spent OUTSIDE the fixed bills: the rows a recurrence
            // posted are already inside `fixedCents`, and counting them in both
            // would make the bar add up to more than the month.
            variableCents={Math.max(report.totalExpenseCents - fixedCents, 0)}
          />
        </div>

        {/* Deciding what to do with the leftover is the next thought after
            reading it, not a separate errand. */}
        <InvestLeftover
          leftoverCents={report.leftoverCents}
          investedCents={report.investedCents}
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

        {bars.length === 0 ? (
          <EmptyState
            title="Nenhuma despesa neste mês"
            description="Assim que você lançar um gasto, ele aparece aqui separado por categoria."
          />
        ) : (
          <div className="mt-4">
            {/* Ranked against the month's whole spending, not against the rows
                on screen: a top-six list must not rescale itself. */}
            <CategoryBars bars={bars} totalCents={report.totalExpenseCents} />
          </div>
        )}
      </section>
    </div>
  )
}
