import type { CardInvoiceDTO, CardInvoicesDTO } from '@bank/adapters'
import { BUDGET_STATUS_TEXT_CLASSES } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'

interface CardInvoiceProps {
  invoices: CardInvoicesDTO
  open: CardInvoiceDTO | undefined
  upcoming: CardInvoiceDTO[]
  /** "fecha 11 set · vence 18 set", spelled by the shared hook so both fronts
   * say it identically. */
  captionOf: (invoice: CardInvoiceDTO) => string
}

/**
 * What a credit card owes: the invoice still taking charges, and what is
 * already committed to the ones after it.
 *
 * The two blocks are kept apart because they answer different questions — the
 * open invoice is the bill coming, the instalments ahead are why the limit is
 * lower than that bill suggests. Folding them into one figure would make a card
 * with a 12x purchase look like it owes twelve times this month.
 *
 * The limit bar only appears when there IS a limit: inventing a zero would
 * report every card as maxed out.
 */
export function CardInvoice({ invoices, open, upcoming, captionOf }: CardInvoiceProps) {
  const committedCents = upcoming.reduce((total, invoice) => total + invoice.amountCents, 0)
  const available = invoices.availableCents ?? 0

  return (
    <div className="mt-2.5 rounded-field bg-ink-bg px-3 py-2.5">
      {open && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-[11px] text-neutral-600">
            Fatura aberta · {captionOf(open)}
          </span>
          <Amount cents={open.amountCents} tone="neutral" className="flex-none text-[13px]" />
        </div>
      )}

      {invoices.limitCents !== null && invoices.limitStatus !== null && (
        <div className="mt-2.5">
          <BudgetBar percentage={invoices.usagePercentage ?? 0} status={invoices.limitStatus} slim />
          <div className="mt-[7px] flex items-baseline justify-between gap-3">
            {/* Over the limit the sentence CHANGES rather than showing a
                negative "available": "R$ 200,00 acima do limite" is the thing
                the owner needs to read, and "−R$ 200,00 disponível" is not a
                sentence anybody parses at a glance. */}
            <span className="min-w-0 truncate text-[11px] text-neutral-600">
              {available >= 0 ? (
                <>
                  <Amount cents={available} tone="income" className="text-[11px]" /> de{' '}
                  <Amount cents={invoices.limitCents} tone="muted" className="text-[11px]" />{' '}
                  disponível
                </>
              ) : (
                <>
                  <Amount cents={-available} tone="expense" className="text-[11px]" /> acima do
                  limite de{' '}
                  <Amount cents={invoices.limitCents} tone="muted" className="text-[11px]" />
                </>
              )}
            </span>
            <span
              className={`flex-none text-[11px] tabular-nums ${
                BUDGET_STATUS_TEXT_CLASSES[invoices.limitStatus]
              }`}
            >
              {invoices.usagePercentage}%
            </span>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-ink-border pt-2">
          <span className="text-[11px] text-neutral-600">
            Parcelas futuras · {upcoming.length === 1 ? '1 fatura' : `${upcoming.length} faturas`}
          </span>
          <Amount cents={committedCents} tone="committed" className="flex-none text-[12px]" />
        </div>
      )}
    </div>
  )
}
