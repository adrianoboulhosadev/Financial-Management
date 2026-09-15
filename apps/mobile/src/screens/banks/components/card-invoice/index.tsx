import { Text, View } from 'react-native'
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
 * What a credit card owes — the same block the web shows, in the layout the
 * phone allows.
 *
 * The open invoice and the instalments ahead stay apart because they answer
 * different questions: one is the bill coming, the other is why the limit is
 * lower than that bill suggests. The limit bar only appears when there IS a
 * limit — inventing a zero would report every card as maxed out.
 */
export function CardInvoice({ invoices, open, upcoming, captionOf }: CardInvoiceProps) {
  const committedCents = upcoming.reduce((total, invoice) => total + invoice.amountCents, 0)
  const available = invoices.availableCents ?? 0

  return (
    <View className="mt-2.5 rounded-field bg-ink-bg px-3 py-2.5">
      {open ? (
        <View className="flex-row items-baseline justify-between gap-3">
          <Text numberOfLines={1} className="flex-1 text-[11px] text-neutral-600">
            Fatura aberta · {captionOf(open)}
          </Text>
          <Amount cents={open.amountCents} className="text-[13px]" />
        </View>
      ) : null}

      {invoices.limitCents !== null && invoices.limitStatus !== null ? (
        <View className="mt-2.5">
          <BudgetBar percentage={invoices.usagePercentage ?? 0} status={invoices.limitStatus} slim />
          <View className="mt-[7px] flex-row items-baseline justify-between gap-3">
            {/* Over the limit the sentence CHANGES rather than showing a
                negative "available": "R$ 200,00 acima do limite" is the thing
                the owner needs to read. */}
            <Text numberOfLines={1} className="flex-1 text-[11px] text-neutral-600">
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
            </Text>
            <Text className={`text-[11px] ${BUDGET_STATUS_TEXT_CLASSES[invoices.limitStatus]}`}>
              {invoices.usagePercentage}%
            </Text>
          </View>
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <View className="mt-2.5 flex-row items-baseline justify-between gap-3 border-t border-ink-border pt-2">
          <Text className="text-[11px] text-neutral-600">
            Parcelas futuras · {upcoming.length === 1 ? '1 fatura' : `${upcoming.length} faturas`}
          </Text>
          <Amount cents={committedCents} tone="committed" className="text-[12px]" />
        </View>
      ) : null}
    </View>
  )
}
