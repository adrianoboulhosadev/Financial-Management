'use client'

import Link from 'next/link'
import { formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { CategoryBars } from '@/components/category-bars'
import { EmptyState } from '@/components/empty-state'
import { Kicker } from '@/components/kicker'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { MonthPie } from '@/components/month-pie'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { StatCard } from '@/components/stat-card'
import { ArrowInIcon, ArrowOutIcon } from '@/data/icons'
import { MonthTimeline } from './components/month-timeline'
import { DASHBOARD_TABS } from './data/tabs'
import { useDashboard } from './hooks/use-dashboard'

/**
 * The screen the product exists for: how much is left this month, and why.
 *
 * The leftover is the HEADLINE — the largest thing on the page — because it is
 * the one figure the owner opens the app to read. Everything under it explains
 * that number: the pie says what the month turned into, the two panes give the
 * raw in and out, and the tabs are three ways of asking "where did it go".
 */
export default function DashboardPage() {
  const {
    period,
    setPeriod,
    report,
    loading,
    tab,
    setTab,
    bars,
    days,
    incomeCents,
    fixedCents,
    pendingFixedCents,
    leftoverShare,
    labelFor,
    captionFor,
  } = useDashboard()

  if (loading || !report) return <Loading />

  return (
    <>
      <ScreenHeader title="Dashboard">
        <MonthPicker period={period} onChange={setPeriod} />
      </ScreenHeader>

      <div className="pb-8 pt-2">
        <div className="flex flex-col gap-3 px-5">
          <Pane className="p-[18px]">
            <Kicker>Sobra do mês</Kicker>
            <p className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[15px] text-neutral-600">R$</span>
              <Amount
                cents={Math.abs(report.leftoverCents)}
                tone={report.leftoverCents < 0 ? 'expense' : 'income'}
                className="text-[38px] font-medium leading-none tracking-[-0.035em]"
              />
            </p>
            <p className="mt-1.5 text-[11.5px] text-neutral-600">
              {incomeCents > 0 ? `${leftoverShare}% do que entrou` : 'sem renda cadastrada'}
              {pendingFixedCents > 0 && ` · ${formatBRL(pendingFixedCents)} ainda a pagar`}
            </p>

            <div className="mt-[18px] border-t border-ink-border pt-[18px]">
              <MonthPie
                incomeCents={incomeCents}
                fixedCents={fixedCents}
                // What was spent OUTSIDE the fixed bills: the rows a recurrence
                // posted are already inside `fixedCents`, and counting them in
                // both would make the circle add up to more than the month.
                variableCents={Math.max(report.totalExpenseCents - fixedCents, 0)}
              />
            </div>
          </Pane>

          <div className="flex gap-3">
            <StatCard
              label="Entrou"
              accent="positive"
              icon={<ArrowInIcon size={13} />}
              value={<Amount cents={incomeCents} tone="income" />}
              hint={
                report.realizedIncomeCents > 0
                  ? `${formatBRL(report.plannedIncomeCents)} fixa + ${formatBRL(report.realizedIncomeCents)} avulso`
                  : 'renda fixa cadastrada'
              }
            />
            <StatCard
              label="Saiu"
              accent="negative"
              icon={<ArrowOutIcon size={13} />}
              // The fixed bills of the month count here whether or not they have
              // been paid yet: money already promised is not money to spend.
              value={<Amount cents={report.totalExpenseCents} tone="expense" />}
              hint={
                report.committedExpenseCents > 0
                  ? `${formatBRL(report.committedExpenseCents)} ainda a pagar`
                  : 'despesas lançadas no mês'
              }
            />
          </div>
        </div>

        <div
          role="tablist"
          className="mb-[18px] mt-5 flex gap-5 border-b border-ink-border px-5"
        >
          {DASHBOARD_TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => setTab(item.value)}
              className={`-mb-px border-b-2 pb-2.5 text-[12.5px] transition-colors ${
                tab === item.value
                  ? 'border-accent text-ink-text'
                  : 'border-transparent text-neutral-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="px-5">
          {tab === 'timeline' && <MonthTimeline days={days} captionFor={captionFor} />}

          {tab === 'categories' &&
            (bars.length === 0 ? (
              <EmptyState
                title="Nenhuma despesa neste mês"
                description="Assim que você lançar um gasto, ele aparece aqui separado por categoria."
              />
            ) : (
              /* Ranked against the month's whole spending, not against the rows
                 on screen: a top-six list must not rescale itself. */
              <CategoryBars bars={bars} totalCents={report.totalExpenseCents} />
            ))}

          {tab === 'budgets' &&
            (report.budgets.length === 0 ? (
              <EmptyState
                title="Nenhum teto definido"
                description="Defina quanto pode gastar por categoria e acompanhe aqui quanto já foi."
                action={
                  <Link href="/budgets" className="text-[11.5px] text-accent-300 hover:underline">
                    Definir um orçamento
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col gap-4">
                {report.budgets.map((usage) => (
                  <li key={usage.budgetId} className="flex flex-col gap-[7px]">
                    <div className="flex items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {labelFor(usage.categoryId)}
                      </span>
                      <span className="text-[11.5px] tabular-nums text-neutral-600">
                        {usage.percentage}%
                      </span>
                    </div>
                    <BudgetBar percentage={usage.percentage} status={usage.status} />
                    <span className="text-[10.5px] tabular-nums text-neutral-600">
                      {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)}
                      {usage.remainingCents < 0
                        ? ` · ${formatBRL(-usage.remainingCents)} acima`
                        : ` · restam ${formatBRL(usage.remainingCents)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>
    </>
  )
}
