'use client'

import Link from 'next/link'
import type { ChecklistItemDTO } from '@transaction/adapters'
import { formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { ScreenHeader } from '@/components/screen-header'
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

  const row = (item: ChecklistItemDTO, last: boolean) => (
    <div key={item.recurrenceId}>
      <ListRow last={last && page.editingId !== item.recurrenceId}>
        <Checkbox
          checked={item.paid}
          // A bill the bank takes on its own is not the owner's to tick, and
          // letting them untick it would only make the list lie until the next
          // read.
          disabled={item.autoPaid}
          onChange={(event) => page.setPaid(item.recurrenceId, event.target.checked)}
          aria-label={`Marcar ${item.description} como pago`}
          className="flex-none disabled:opacity-50"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-[13px] ${
              item.paid ? 'text-neutral-400 line-through decoration-neutral-700' : ''
            }`}
          >
            {item.description}
          </p>
          <p
            className={`mt-0.5 truncate text-[11px] ${
              !item.paid && item.variableAmount ? 'text-warning' : 'text-neutral-600'
            }`}
          >
            {page.captionFor(item)}
          </p>
          {/* The estimate stays visible next to the corrected figure: the gap
              between the two is the surprise the owner wants to see. */}
          {item.variableAmount && item.amountCents !== item.estimatedCents && (
            <p className="mt-0.5 text-[10.5px] text-neutral-700">
              previsto {formatBRL(item.estimatedCents)}
            </p>
          )}
        </div>

        <Amount
          cents={item.amountCents}
          tone={item.paid ? 'muted' : 'neutral'}
          className={`flex-none text-[13px] ${item.paid ? '' : 'text-neutral-400'}`}
        />

        {/* Only a bill declared variable at creation may be corrected — the
            same rule the backend enforces, made unclickable here. */}
        {item.variableAmount && page.editingId !== item.recurrenceId && (
          <button
            type="button"
            onClick={() => page.startEditing(item)}
            className="flex-none text-[11px] text-accent-300 hover:underline"
          >
            Veio quanto?
          </button>
        )}
      </ListRow>

      {page.editingId === item.recurrenceId && (
        <div className={`flex flex-col gap-3 pb-4 ${last ? '' : 'border-b border-ink-border'}`}>
          <Field
            label="Valor da conta deste mês (R$)"
            money
            placeholder="0,00"
            value={page.draftAmount}
            onChange={(event) => page.setDraftAmount(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              className="flex-1"
              onClick={page.confirmEditing}
              disabled={page.adjusting || !page.draftAmount}
            >
              Salvar
            </Button>
            {item.amountCents !== item.estimatedCents && (
              <Button variant="secondary" onClick={() => page.clearAdjustment(item)}>
                Voltar ao previsto
              </Button>
            )}
            <Button variant="ghost" onClick={page.cancelEditing}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <ScreenHeader
        title="A pagar"
        backHref="/more"
        bordered
        subtitle={
          <>
            {formatBRL(page.pendingCents)} em aberto de {formatBRL(page.totalCents)} ·{' '}
            {page.settled.length} de {page.items.length} quitados
          </>
        }
      >
        <MonthPicker period={page.period} onChange={page.setPeriod} />

        <div className="mt-3 h-[5px] w-full overflow-hidden rounded-full bg-ink-border">
          <div
            className="h-full bg-positive transition-all"
            style={{ width: `${page.settledPercentage}%` }}
          />
        </div>
      </ScreenHeader>

      <div className="px-5 pb-8 pt-4">
        {page.loading ? (
          <Loading compact />
        ) : page.items.length === 0 ? (
          <EmptyState
            title="Nenhum fixo neste mês"
            description="Cadastre o que se repete todo mês e ele aparece aqui para você marcar conforme paga."
            action={
              <Link href="/recurrences" className="text-[11.5px] text-accent-300 hover:underline">
                Cadastrar fixo
              </Link>
            }
          />
        ) : (
          <>
            {page.open.length > 0 && (
              <section>
                <Kicker className="pb-1">Em aberto</Kicker>
                {page.open.map((item, index) => row(item, index === page.open.length - 1))}
              </section>
            )}

            {page.settled.length > 0 && (
              <section>
                <Kicker className="pb-1 pt-[18px]">Pagos</Kicker>
                {page.settled.map((item, index) => row(item, index === page.settled.length - 1))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
