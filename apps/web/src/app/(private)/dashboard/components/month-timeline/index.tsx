import type { TransactionDTO } from '@transaction/adapters'
import type { DayGroup } from 'ui'
import { formatDayHeading } from 'ui'
import { Amount } from '@/components/amount'
import { EmptyState } from '@/components/empty-state'

interface MonthTimelineProps {
  days: DayGroup<TransactionDTO>[]
  captionFor: (transaction: TransactionDTO) => string
}

/**
 * The month as it actually happened, newest first, hung off a single rail.
 *
 * The rail earns its ink: it is what turns a flat list into a sequence, so the
 * gaps between days read as time rather than as padding. Only the most recent
 * day gets a filled node — it is "where you are", and marking every day would
 * make the marker mean nothing.
 *
 * Each day carries its own net, because the question the owner asks of a day is
 * not what each line cost but whether the day as a whole took money or brought
 * it.
 */
export function MonthTimeline({ days, captionFor }: MonthTimelineProps) {
  if (days.length === 0) {
    return (
      <EmptyState
        title="Nada lançado neste mês"
        description="Assim que você registrar um gasto ou uma entrada, o mês aparece aqui dia a dia."
      />
    )
  }

  return (
    <div className="flex gap-3.5">
      <div className="ml-[5px] w-0.5 rounded-full bg-ink-border" />

      <ol className="-ml-[21px] flex flex-1 flex-col gap-5">
        {days.map((day, index) => {
          const netCents = day.items.reduce(
            (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
            0,
          )

          return (
            <li key={day.day}>
              <div className="flex items-center gap-3">
                {/* The ring is a box-shadow and not a border: the node already
                    spends its border on a 3px cut of background, which is what
                    makes it sit ON the rail instead of beside it. */}
                <span
                  className={`h-3 w-3 flex-none rounded-full border-[3px] border-ink-bg ${
                    index === 0
                      ? 'bg-accent shadow-[0_0_0_1px_#9184d9]'
                      : 'bg-ink-bg shadow-[0_0_0_1px_#595d6c]'
                  }`}
                />
                <span
                  className={`text-xs font-medium capitalize ${index === 0 ? '' : 'text-neutral-400'}`}
                >
                  {formatDayHeading(day.date)}
                </span>
                <Amount cents={netCents} signed tone="muted" className="text-[11px]" />
              </div>

              <ul className="ml-[26px] mt-2.5 flex flex-col gap-2.5">
                {day.items.map((transaction) => (
                  <li key={transaction.id} className="flex items-baseline gap-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{transaction.description}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-neutral-600">
                        {captionFor(transaction)}
                      </span>
                    </span>
                    <Amount
                      cents={transaction.amount}
                      tone={transaction.type === 'income' ? 'income' : 'expense'}
                      signed
                      className="flex-none text-[13px]"
                    />
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
