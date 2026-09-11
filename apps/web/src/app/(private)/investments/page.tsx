'use client'

import { INVESTMENT_KIND_LABELS, formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { InvestmentsIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { InvestLeftover } from './components/invest-leftover'
import { InvestmentForm } from './components/investment-form'
import { useInvestmentsPage } from './hooks/use-investments-page'

/**
 * What the owner put away to grow.
 *
 * The return is CALCULATED from what went in and what it is worth today, never
 * stored — which is what keeps the two figures from ever disagreeing — and it
 * is the only signed number in the product, because "quanto eu perdi" is
 * exactly what has to be visible.
 */
export default function InvestmentsPage() {
  const page = useInvestmentsPage()

  return (
    <>
      <ScreenHeader
        title="Investimentos"
        backHref="/more"
        action={
          <button
            type="button"
            onClick={page.openComposer}
            aria-label="Novo investimento"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-5 pb-8 pt-1">
        {page.loading || !page.portfolio ? (
          <Loading compact />
        ) : (
          <>
            <Pane className="p-[18px]">
              <Kicker>Total aplicado</Kicker>
              <p className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-[15px] text-neutral-600">R$</span>
                <Amount
                  cents={page.portfolio.valueCents}
                  className="text-[34px] font-medium leading-none tracking-[-0.03em]"
                />
              </p>
              <p
                className={`mt-1.5 text-[11.5px] ${
                  page.portfolio.returnCents < 0 ? 'text-negative' : 'text-positive'
                }`}
              >
                {page.portfolio.returnCents >= 0 ? '+' : '−'}
                {formatBRL(Math.abs(page.portfolio.returnCents))}{' '}
                {page.portfolio.returnCents < 0 ? 'de prejuízo' : 'de rendimento'} ·{' '}
                {formatBRL(page.portfolio.investedCents)} aplicados
              </p>
            </Pane>

            {/* Deciding what to do with the leftover is the next thought after
                reading it, not a separate errand. */}
            <InvestLeftover
              leftoverCents={page.leftoverCents}
              investedCents={page.investedThisMonthCents}
            />

            {page.portfolio.byKind.length > 0 && (
              <Pane className="px-[18px] py-4">
                <Kicker>Onde está</Kicker>
                <ul className="mt-3 flex flex-col gap-4">
                  {page.portfolio.byKind.map((slice) => (
                    <li key={slice.kind} className="flex flex-col gap-[7px]">
                      <div className="flex items-baseline gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13px]">
                          {INVESTMENT_KIND_LABELS[slice.kind]}
                        </span>
                        <Amount cents={slice.valueCents} className="text-[11.5px] text-neutral-500" />
                      </div>
                      {/* Share of the portfolio, so the list reads as a
                          composition and not just as numbers. */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-border">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${
                              page.portfolio!.valueCents === 0
                                ? 0
                                : Math.round((slice.valueCents / page.portfolio!.valueCents) * 100)
                            }%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Pane>
            )}
          </>
        )}

        {!page.loading && page.investments.length === 0 ? (
          <EmptyState
            title="Nenhum investimento cadastrado"
            description="Cadastre o que você já aplicou para acompanhar quanto rendeu."
            action={<Button onClick={page.openComposer}>Cadastrar investimento</Button>}
          />
        ) : (
          <Pane className="px-[18px] py-4">
            <Kicker>Seus investimentos</Kicker>
            <div className="mt-1.5">
              {page.investments.map((investment, index) => {
                const last = index === page.investments.length - 1

                return (
                  <div key={investment.id}>
                    <ListRow last={last && page.editingId !== investment.id}>
                      <IconBadge tone={investment.active ? 'accent' : 'muted'}>
                        <InvestmentsIcon size={17} />
                      </IconBadge>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[13px] ${
                            investment.active
                              ? ''
                              : 'text-neutral-500 line-through decoration-neutral-700'
                          }`}
                        >
                          {investment.name}
                        </p>
                        <p className="mt-[3px] truncate text-[11px] text-neutral-600">
                          {page.captionFor(investment)}
                        </p>
                        {page.returnOf(investment) !== 0 && (
                          <Amount
                            cents={page.returnOf(investment)}
                            tone="movement"
                            signed
                            className="mt-0.5 block text-[11px]"
                          />
                        )}
                      </div>

                      <Amount
                        cents={investment.currentAmount ?? investment.investedAmount}
                        tone={investment.active ? 'neutral' : 'muted'}
                        className="flex-none text-[13px]"
                      />

                      <button
                        type="button"
                        onClick={() => page.startEditing(investment)}
                        className="flex-none text-[11px] text-accent-300 hover:underline"
                      >
                        Atualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => page.toggleActive(investment)}
                        className="flex-none text-[11px] text-neutral-500 hover:text-ink-text"
                      >
                        {investment.active ? 'Resgatar' : 'Reativar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => page.askToDelete(investment)}
                        aria-label={`Excluir ${investment.name}`}
                        className="flex-none text-neutral-700 transition-colors hover:text-negative"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </ListRow>

                    {page.editingId === investment.id && (
                      <div
                        className={`flex flex-col gap-3 pb-4 ${last ? '' : 'border-b border-ink-border'}`}
                      >
                        <Field
                          label="Quanto vale hoje (R$)"
                          money
                          placeholder="0,00"
                          value={page.draftValue}
                          onChange={(event) => page.setDraftValue(event.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={page.confirmEditing}
                            disabled={!page.draftValue}
                          >
                            Salvar
                          </Button>
                          <Button variant="ghost" onClick={page.cancelEditing}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Pane>
        )}
      </div>

      <Sheet open={page.composing} title="Novo investimento" onClose={page.closeComposer}>
        <InvestmentForm onSubmit={page.create} submitting={page.creating} />
      </Sheet>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir investimento"
        description={
          page.pendingDeletion
            ? `"${page.pendingDeletion.name}" sai da carteira e do histórico. Se ele só foi resgatado, prefira "Resgatar" — assim o registro fica.`
            : undefined
        }
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </>
  )
}
