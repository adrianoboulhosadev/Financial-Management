'use client'

import { formatBRL, formatDayHeading, TRANSACTION_FILTERS } from 'ui'
import { Amount } from '@/components/amount'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Fab } from '@/components/fab'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { ArrowInIcon, ArrowOutIcon, TrashIcon } from '@/data/icons'
import { TransactionForm } from './components/transaction-form'
import { useTransactions } from './hooks/use-transactions'

/**
 * Everything that moved this month, newest day first.
 *
 * The rows are grouped by DAY with the day's own net in the heading, because
 * that is the unit the owner remembers spending in — "what did Tuesday cost"
 * is a question this list can answer at a glance, and a flat list of twenty
 * dated rows cannot.
 */
export default function TransactionsPage() {
  const {
    period,
    setPeriod,
    days,
    filter,
    setFilter,
    transactions,
    loading,
    composing,
    openComposer,
    closeComposer,
    record,
    recording,
    pendingDeletion,
    askToDelete,
    cancelDeletion,
    confirmDeletion,
    captionFor,
  } = useTransactions()

  const netCents = transactions.reduce(
    (sum, transaction) =>
      sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0,
  )

  return (
    <>
      <ScreenHeader title="Lançamentos">
        <MonthPicker period={period} onChange={setPeriod} />

        <p className="mt-2.5 text-[11.5px] text-neutral-600">
          {transactions.length} {transactions.length === 1 ? 'registro' : 'registros'} · saldo{' '}
          {formatBRL(netCents)}
        </p>

        <div className="mt-3.5 flex gap-1.5 overflow-x-auto pb-3.5">
          {TRANSACTION_FILTERS.map((option) => (
            <Chip
              key={option.value}
              active={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </ScreenHeader>

      <div className="px-5 pb-8">
        {loading ? (
          <Loading compact />
        ) : days.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento neste mês"
            description="Toque no + para registrar o primeiro gasto ou entrada do mês."
          />
        ) : (
          days.map((day, index) => {
            const dayNetCents = day.items.reduce(
              (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
              0,
            )

            return (
              <section key={day.day}>
                <Kicker
                  className={`pb-1.5 capitalize ${
                    index === 0 ? 'border-t border-ink-border pt-3.5' : 'pt-[18px]'
                  }`}
                >
                  {formatDayHeading(day.date)} · {formatBRL(dayNetCents)}
                </Kicker>

                {day.items.map((transaction) => (
                  <ListRow key={transaction.id}>
                    <IconBadge tone={transaction.type === 'income' ? 'income' : 'accent'}>
                      {transaction.type === 'income' ? (
                        <ArrowInIcon size={17} />
                      ) : (
                        <ArrowOutIcon size={17} />
                      )}
                    </IconBadge>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px]">{transaction.description}</p>
                      <p className="mt-[3px] truncate text-[11px] text-neutral-600">
                        {captionFor(transaction)}
                      </p>
                    </div>

                    <Amount
                      cents={transaction.amount}
                      tone={transaction.type === 'income' ? 'income' : 'expense'}
                      signed
                      className="flex-none text-[13.5px]"
                    />

                    <button
                      type="button"
                      onClick={() => askToDelete(transaction)}
                      aria-label={`Excluir ${transaction.description}`}
                      className="flex-none text-neutral-700 transition-colors hover:text-negative"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </ListRow>
                ))}
              </section>
            )
          })
        )}
      </div>

      <Fab onClick={openComposer} aria-label="Novo lançamento" />

      <Sheet open={composing} title="Novo lançamento" onClose={closeComposer}>
        <TransactionForm onSubmit={record} submitting={recording} />
      </Sheet>

      <ConfirmDialog
        open={pendingDeletion !== null}
        title="Excluir lançamento"
        description={
          pendingDeletion
            ? `"${pendingDeletion.description}" sai do mês e os totais são recalculados. Não dá pra desfazer.`
            : undefined
        }
        onConfirm={confirmDeletion}
        onCancel={cancelDeletion}
      />
    </>
  )
}
