'use client'

import { Amount } from '@/components/amount'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { formatDate } from 'ui'
import { TRANSACTION_FILTERS } from 'ui'
import { TransactionForm } from './components/transaction-form'
import { useTransactions } from './hooks/use-transactions'

export default function TransactionsPage() {
  const {
    period,
    setPeriod,
    filter,
    setFilter,
    transactions,
    loading,
    record,
    recording,
    pendingDeletion,
    askToDelete,
    cancelDeletion,
    confirmDeletion,
    labelFor,
  } = useTransactions()

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthPicker period={period} onChange={setPeriod} />

          <div className="inline-flex rounded-lg border border-ink-border p-1">
            {TRANSACTION_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-ink-surface-soft text-ink-text'
                    : 'text-ink-text-muted hover:text-ink-text'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loading compact />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento neste mês"
            description="Use o formulário ao lado para registrar o primeiro."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{transaction.description}</p>
                  <p className="mt-0.5 text-xs text-ink-text-muted">
                    {formatDate(transaction.occurredOn)} · {labelFor(transaction.categoryId)}
                    {/* A row the worker posted, not the user — worth saying, so
                        nobody wonders where it came from. */}
                    {transaction.recurrenceId && ' · fixo'}
                  </p>
                </div>

                <Amount
                  cents={transaction.amount}
                  tone={transaction.type === 'expense' ? 'expense' : 'income'}
                  signed
                  className="text-sm"
                />

                <button
                  type="button"
                  onClick={() => askToDelete(transaction)}
                  aria-label={`Excluir ${transaction.description}`}
                  className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <TransactionForm onSubmit={record} submitting={recording} />
      </aside>

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
    </div>
  )
}
