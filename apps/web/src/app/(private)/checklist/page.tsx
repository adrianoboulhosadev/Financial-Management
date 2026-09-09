'use client'

import Link from 'next/link'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { StatCard } from '@/components/stat-card'
import { formatBRL, formatDate } from 'ui'
import { useChecklistPage } from './hooks/use-checklist-page'

/**
 * The month's to-do list of fixed bills. Nothing here is created by hand: every
 * active recurrence is a line, and the only thing stored is what deviates from
 * the default — a month ticked off, or what a variable bill actually came to.
 *
 * A bill on pix/direct debit ticks itself once its day passes, which is why its
 * checkbox is disabled rather than absent: the owner can see it is settled and
 * see why nobody had to say so.
 */
export default function ChecklistPage() {
  const page = useChecklistPage()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker period={page.period} onChange={page.setPeriod} />
        <Link href="/recurrences" className="text-sm text-accent hover:underline">
          Gerenciar fixos
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total do mês"
          value={<Amount cents={page.totalCents} tone="expense" />}
          hint="tudo que se repete todo mês"
        />
        <StatCard
          label="Já pago"
          accent="positive"
          value={<Amount cents={page.paidCents} tone="income" />}
          hint="marcado ou em débito automático"
        />
        <StatCard
          label="Falta pagar"
          accent="negative"
          value={<Amount cents={page.pendingCents} tone="expense" />}
          hint={page.pendingCents === 0 ? 'mês fechado' : 'ainda em aberto'}
        />
      </section>

      {page.loading ? (
        <Loading compact />
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Nenhum fixo neste mês"
          description="Cadastre o que se repete todo mês e ele aparece aqui para você marcar conforme paga."
          action={
            <Link
              href="/recurrences"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink-bg hover:bg-accent/90"
            >
              Cadastrar fixo
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
          {page.items.map((item) => (
            <li key={item.recurrenceId} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.paid}
                  // A bill the bank takes on its own is not the owner's to
                  // tick, and letting them untick it would only make the list
                  // lie until the next read.
                  disabled={item.autoPaid}
                  onChange={(event) => page.setPaid(item.recurrenceId, event.target.checked)}
                  aria-label={`Marcar ${item.description} como pago`}
                  className="h-4 w-4 shrink-0 accent-positive disabled:opacity-50"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${item.paid ? 'text-ink-text-muted line-through' : ''}`}
                  >
                    {item.description}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-text-muted">
                    vence em {formatDate(item.dueOn)} · {page.labelFor(item.categoryId)}
                    {item.autoPaid && ' · automático'}
                    {item.posted && ' · já lançado'}
                  </p>
                  {/* The estimate stays visible next to the corrected figure:
                      the gap between the two is the surprise the owner wants to
                      see. */}
                  {item.variableAmount && item.amountCents !== item.estimatedCents && (
                    <p className="mt-0.5 text-xs text-ink-text-muted">
                      previsto {formatBRL(item.estimatedCents)}
                    </p>
                  )}
                </div>

                <Amount
                  cents={item.amountCents}
                  tone={item.type === 'expense' ? 'expense' : 'income'}
                  className="text-sm"
                />

                {/* Only a bill declared variable at creation may be corrected —
                    the same rule the backend enforces, made unclickable here. */}
                {item.variableAmount && page.editingId !== item.recurrenceId && (
                  <button
                    type="button"
                    onClick={() => page.startEditing(item)}
                    className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                  >
                    Veio quanto?
                  </button>
                )}
              </div>

              {page.editingId === item.recurrenceId && (
                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-ink-border pt-3">
                  <div className="min-w-[10rem] flex-1">
                    <Field
                      label="Valor da conta deste mês (R$)"
                      money
                      placeholder="0,00"
                      value={page.draftAmount}
                      onChange={(event) => page.setDraftAmount(event.target.value)}
                    />
                  </div>
                  <Button onClick={page.confirmEditing} disabled={page.adjusting || !page.draftAmount}>
                    Salvar
                  </Button>
                  {item.amountCents !== item.estimatedCents && (
                    <Button variant="ghost" onClick={() => page.clearAdjustment(item)}>
                      Voltar ao previsto
                    </Button>
                  )}
                  <Button variant="ghost" onClick={page.cancelEditing}>
                    Cancelar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
