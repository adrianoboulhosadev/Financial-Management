'use client'

import { formatBRL, formatPeriodShort, toPeriod } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthBars } from '@/components/month-bars'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { ArrowInIcon, BanksIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { useIncome } from './hooks/use-income'

/**
 * What comes in: the sources that repeat, and the one-offs that did not.
 *
 * A source generates NO transaction — it is the plan, not the money — which is
 * what keeps it from double-counting against a salary the owner also recorded
 * by hand. The two halves are shown side by side for exactly that reason: they
 * are different kinds of fact about the same month.
 */
export default function IncomePage() {
  const page = useIncome()
  const monthLabel = formatPeriodShort(toPeriod()).split(' ')[0]

  return (
    <>
      <ScreenHeader
        title="Renda"
        action={
          <button
            type="button"
            onClick={page.openComposer}
            aria-label="Nova fonte de renda"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-5 pb-8 pt-1">
        <Pane className="p-[18px]">
          <Kicker className="capitalize">Entrou em {monthLabel}</Kicker>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[15px] text-neutral-600">R$</span>
            <Amount
              cents={page.totalCents}
              tone="income"
              className="text-[34px] font-medium leading-none tracking-[-0.03em]"
            />
          </p>

          {page.totalCents > 0 && (
            <>
              <div className="mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                <div
                  className="bg-positive"
                  style={{ width: `${(page.monthlyTotal / page.totalCents) * 100}%` }}
                />
                <div
                  className="bg-accent"
                  style={{ width: `${(page.realizedCents / page.totalCents) * 100}%` }}
                />
              </div>

              <ul className="mt-2.5 flex gap-[18px]">
                <li className="flex items-center gap-[7px]">
                  <span className="h-[7px] w-[7px] rounded-sm bg-positive" />
                  <span className="text-[11.5px] text-neutral-500">
                    Fixa {formatBRL(page.monthlyTotal)}
                  </span>
                </li>
                <li className="flex items-center gap-[7px]">
                  <span className="h-[7px] w-[7px] rounded-sm bg-accent" />
                  <span className="text-[11.5px] text-neutral-500">
                    Avulsa {formatBRL(page.realizedCents)}
                  </span>
                </li>
              </ul>
            </>
          )}
        </Pane>

        {page.loading ? (
          <Loading compact />
        ) : page.sources.length === 0 ? (
          <EmptyState
            title="Nenhuma fonte de renda"
            description="Cadastre seu salário — é a base do cálculo de quanto sobra no mês."
            action={<Button onClick={page.openComposer}>Cadastrar renda</Button>}
          />
        ) : (
          <Pane className="px-[18px] py-4">
            <Kicker>Renda fixa</Kicker>
            <div className="mt-1.5">
              {page.sources.map((source, index) => (
                <ListRow key={source.id} last={index === page.sources.length - 1}>
                  <IconBadge tone={source.active ? 'accent' : 'muted'}>
                    <BanksIcon size={17} />
                  </IconBadge>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13px] ${
                        source.active ? '' : 'text-neutral-500 line-through decoration-neutral-700'
                      }`}
                    >
                      {source.name}
                    </p>
                    <p className="mt-[3px] truncate text-[11px] text-neutral-600">
                      {page.sourceCaptionFor(source)}
                    </p>
                  </div>

                  <Amount
                    cents={source.amount}
                    tone={source.active ? 'income' : 'muted'}
                    className="flex-none text-[13px]"
                  />

                  <button
                    type="button"
                    onClick={() => page.toggleActive(source)}
                    className="flex-none text-[11px] text-accent-300 hover:underline"
                  >
                    {source.active ? 'Pausar' : 'Retomar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => page.askToDelete(source)}
                    aria-label={`Excluir ${source.name}`}
                    className="flex-none text-neutral-700 transition-colors hover:text-negative"
                  >
                    <TrashIcon size={16} />
                  </button>
                </ListRow>
              ))}
            </div>
          </Pane>
        )}

        {page.oneOffs.length > 0 && (
          <Pane className="px-[18px] py-4">
            <Kicker>Avulsos do mês</Kicker>
            <div className="mt-1.5">
              {page.oneOffs.map((transaction, index) => (
                <ListRow key={transaction.id} last={index === page.oneOffs.length - 1}>
                  <IconBadge tone="income">
                    <ArrowInIcon size={17} />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{transaction.description}</p>
                    <p className="mt-[3px] truncate text-[11px] text-neutral-600">
                      {page.oneOffCaptionFor(transaction)}
                    </p>
                  </div>
                  <Amount
                    cents={transaction.amount}
                    tone="income"
                    className="flex-none text-[13px]"
                  />
                </ListRow>
              ))}
            </div>
          </Pane>
        )}

        <Pane className="px-[18px] py-4">
          <Kicker>Média dos últimos 6 meses</Kicker>
          <div className="mt-3.5">
            <MonthBars bars={page.history} />
          </div>
          <p className="mt-2.5 text-[11.5px] tabular-nums text-neutral-600">
            média {formatBRL(page.averageCents)}
            {page.versusAverage !== null &&
              page.versusAverage !== 0 &&
              ` · ${monthLabel} está ${Math.abs(page.versusAverage)}% ${
                page.versusAverage > 0 ? 'acima' : 'abaixo'
              }`}
          </p>
        </Pane>
      </div>

      <Sheet open={page.composing} title="Nova fonte de renda" onClose={page.closeComposer}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.name.trim() && page.amount) page.create()
          }}
          className="flex flex-col gap-4"
        >
          <p className="text-[11.5px] leading-relaxed text-neutral-600">
            Isto é o que você recebe todo mês. Não vira lançamento — receita avulsa você registra em
            Lançamentos.
          </p>

          <Field
            label="Nome"
            placeholder="Salário, aluguel recebido…"
            value={page.name}
            onChange={(event) => page.setName(event.target.value)}
          />
          <Field
            label="Valor mensal (R$)"
            money
            placeholder="5.000,00"
            value={page.amount}
            onChange={(event) => page.setAmount(event.target.value)}
          />
          <Field
            label="Dia do recebimento"
            type="number"
            min={1}
            max={31}
            value={page.payday}
            onChange={(event) => page.setPayday(event.target.value)}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={page.creating || !page.name.trim() || !page.amount}
          >
            {page.creating ? 'Salvando…' : 'Adicionar'}
          </Button>
        </form>
      </Sheet>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir fonte de renda"
        description="Se ela só parou de pagar, prefira pausar — assim o histórico do que era o plano continua."
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </>
  )
}
