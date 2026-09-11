'use client'

import { BUDGET_STATUS_TEXT_CLASSES, formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { PlusIcon } from '@/data/icons'
import { useBudgets } from './hooks/use-budgets'

/**
 * What the month was allowed to cost, and how much of that is gone.
 *
 * A ceiling NEVER blocks a purchase — spent money is a fact, and refusing to
 * record it would only make the numbers lie. Everything here is a reading, not
 * a gate.
 */
export default function BudgetsPage() {
  const page = useBudgets()

  return (
    <>
      <ScreenHeader
        title="Orçamentos"
        backHref="/more"
        action={
          <button
            type="button"
            onClick={() => page.openComposer()}
            aria-label="Definir orçamento"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
      >
        <MonthPicker period={page.period} onChange={page.setPeriod} />
      </ScreenHeader>

      <div className="flex flex-col gap-3 px-5 pb-8 pt-1">
        {page.loading ? (
          <Loading compact />
        ) : page.usages.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento definido"
            description="Escolha uma categoria e diga quanto você quer gastar por mês nela."
            action={
              <Button onClick={() => page.openComposer()}>Definir o primeiro teto</Button>
            }
          />
        ) : (
          <>
            <Pane className="px-[18px] py-4">
              <Kicker>Gasto sob teto</Kicker>
              <p className="mt-1.5 flex items-baseline gap-2">
                <Amount
                  cents={page.spentCents}
                  className="text-[26px] font-medium tracking-[-0.02em]"
                />
                <span className="text-xs tabular-nums text-neutral-600">
                  de {formatBRL(page.limitCents)}
                </span>
              </p>

              <div className="mt-3">
                <BudgetBar
                  percentage={page.cappedPercentage}
                  status={
                    page.cappedPercentage >= 100
                      ? 'exceeded'
                      : page.cappedPercentage >= 80
                        ? 'warning'
                        : 'ok'
                  }
                />
              </div>

              <p className="mt-2.5 text-[11.5px] text-neutral-600">
                {page.remainingCents >= 0
                  ? `Restam ${formatBRL(page.remainingCents)}`
                  : `${formatBRL(-page.remainingCents)} acima do teto`}
                {page.daysLeft !== null && ` para os últimos ${page.daysLeft} dias do mês`}
              </p>
            </Pane>

            <Pane className="flex flex-col gap-4 px-[18px] py-4">
              {page.usages.map((usage) => (
                <div key={usage.budgetId} className="flex flex-col gap-[7px]">
                  <div className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate text-[13px]">
                      {page.labelFor(usage.categoryId)}
                    </span>
                    <span
                      className={`text-[11.5px] tabular-nums ${BUDGET_STATUS_TEXT_CLASSES[usage.status]}`}
                    >
                      {usage.percentage}%
                    </span>
                    <button
                      type="button"
                      onClick={() => page.askToDelete(usage)}
                      aria-label={`Remover teto de ${page.labelFor(usage.categoryId)}`}
                      className="text-[11px] text-neutral-700 transition-colors hover:text-negative"
                    >
                      Remover
                    </button>
                  </div>

                  <BudgetBar percentage={usage.percentage} status={usage.status} />

                  <span
                    className={`text-[10.5px] tabular-nums ${
                      usage.remainingCents < 0 ? 'text-negative' : 'text-neutral-600'
                    }`}
                  >
                    {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)} ·{' '}
                    {usage.remainingCents >= 0
                      ? `restam ${formatBRL(usage.remainingCents)}`
                      : `${formatBRL(-usage.remainingCents)} acima`}
                  </span>
                </div>
              ))}
            </Pane>
          </>
        )}

        {page.uncapped.length > 0 && (
          <Pane className="px-[18px] py-4">
            <Kicker>Sem teto definido</Kicker>
            <ul className="mt-3 flex flex-col gap-3">
              {page.uncapped.map((total) => (
                <li key={total.categoryId} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-neutral-400">
                    {page.labelFor(total.categoryId)}
                  </span>
                  <Amount cents={total.spentCents} className="text-[12.5px]" />
                  <button
                    type="button"
                    onClick={() => page.openComposer(total.categoryId)}
                    className="flex-none text-[11px] text-accent-300 hover:underline"
                  >
                    Definir
                  </button>
                </li>
              ))}
            </ul>
          </Pane>
        )}
      </div>

      <Sheet open={page.composing} title="Definir orçamento" onClose={page.closeComposer}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.categoryId && page.amount) page.save()
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-[11.5px] leading-relaxed text-neutral-600">
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
      </Sheet>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Remover orçamento"
        description="A categoria continua existindo — ela só deixa de ser acompanhada."
        confirmLabel="Remover"
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </>
  )
}
