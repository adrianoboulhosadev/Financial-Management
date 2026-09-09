'use client'

import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { StatCard } from '@/components/stat-card'
import { INVESTMENT_KIND_LABELS, formatBRL, formatDate } from 'ui'
import { InvestmentForm } from './components/investment-form'
import { useInvestmentsPage } from './hooks/use-investments-page'

/**
 * What the owner put away to grow. The three figures at the top are the whole
 * point of the screen: what went in, what it is worth, what it made — and the
 * last one is the only signed number in the product, because "quanto eu perdi"
 * is exactly what has to be visible.
 */
export default function InvestmentsPage() {
  const page = useInvestmentsPage()

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        {page.loading || !page.portfolio ? (
          <Loading compact />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Aplicado"
                value={<Amount cents={page.portfolio.investedCents} />}
                hint="tudo que você colocou"
              />
              <StatCard
                label="Hoje"
                accent="accent"
                value={<Amount cents={page.portfolio.valueCents} />}
                hint="valor atual da carteira"
              />
              <StatCard
                label="Rendimento"
                accent={page.portfolio.returnCents < 0 ? 'negative' : 'positive'}
                value={<Amount cents={page.portfolio.returnCents} tone="movement" signed />}
                hint={page.portfolio.returnCents < 0 ? 'no vermelho' : 'o que rendeu até agora'}
              />
            </div>

            {page.portfolio.byKind.length > 0 && (
              <section className="rounded-card border border-ink-border bg-ink-surface p-5 shadow-card">
                <h2 className="text-sm font-semibold">Onde está o dinheiro</h2>
                <ul className="mt-4 space-y-2.5">
                  {page.portfolio.byKind.map((slice) => (
                    <li key={slice.kind} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-ink-text-soft">
                          {INVESTMENT_KIND_LABELS[slice.kind]}
                        </span>
                        <Amount cents={slice.valueCents} />
                      </div>
                      {/* Share of the portfolio, so the list reads as a
                          composition and not just as numbers. */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-surface-soft">
                        <div
                          className="h-full rounded-full bg-accent/70"
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
              </section>
            )}
          </>
        )}

        {!page.loading && page.investments.length === 0 ? (
          <EmptyState
            title="Nenhum investimento cadastrado"
            description="Cadastre ao lado o que você já aplicou para acompanhar quanto rendeu."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.investments.map((investment) => (
              <li key={investment.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${investment.active ? '' : 'text-ink-text-muted line-through'}`}
                    >
                      {investment.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-text-muted">
                      {[
                        INVESTMENT_KIND_LABELS[investment.kind],
                        page.bankNameOf(investment.bankId),
                        `desde ${formatDate(investment.startedOn)}`,
                        investment.maturityOn && `vence ${formatDate(investment.maturityOn)}`,
                        !investment.active && 'resgatado',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {investment.notes && (
                      <p className="mt-0.5 truncate text-xs text-ink-text-muted">
                        {investment.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <Amount
                      cents={investment.currentAmount ?? investment.investedAmount}
                      className="block text-sm"
                    />
                    <span className="mt-0.5 block text-xs text-ink-text-muted">
                      aplicou {formatBRL(investment.investedAmount)}
                    </span>
                    {page.returnOf(investment) !== 0 && (
                      <Amount
                        cents={page.returnOf(investment)}
                        tone="movement"
                        signed
                        className="mt-0.5 block text-xs"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => page.startEditing(investment)}
                    className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                  >
                    Atualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => page.toggleActive(investment)}
                    className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                  >
                    {investment.active ? 'Resgatar' : 'Reativar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => page.askToDelete(investment)}
                    aria-label={`Excluir ${investment.name}`}
                    className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                  >
                    ✕
                  </button>
                </div>

                {page.editingId === investment.id && (
                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-ink-border pt-3">
                    <div className="min-w-[10rem] flex-1">
                      <Field
                        label="Quanto vale hoje (R$)"
                        money
                        placeholder="0,00"
                        value={page.draftValue}
                        onChange={(event) => page.setDraftValue(event.target.value)}
                      />
                    </div>
                    <Button onClick={page.confirmEditing} disabled={!page.draftValue}>
                      Salvar
                    </Button>
                    <Button variant="ghost" onClick={page.cancelEditing}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <InvestmentForm onSubmit={page.create} submitting={page.creating} />
      </aside>

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
    </div>
  )
}
