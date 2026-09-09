'use client'

import Link from 'next/link'
import { PAYMENT_METHOD_OPTIONS } from 'ui'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { usePaymentFields } from './hooks/use-payment-fields'

interface PaymentFieldsProps {
  bankId: string
  onBankChange: (bankId: string) => void
  paymentMethod: string
  onPaymentMethodChange: (paymentMethod: string) => void
  cardId: string
  onCardChange: (cardId: string) => void
  /** Absent on the fixed-bill form: a recurrence repeats every month, so it is
   * never "3x". */
  installments?: string
  onInstallmentsChange?: (installments: string) => void
}

/**
 * Where the money went through and how — the block shared by the movement form
 * and the fixed-bill form, because both answer exactly the same question.
 *
 * What is on screen follows the method: a card only when one is being used, and
 * instalments only on credit. Hiding the fields that cannot apply is the same
 * rule the domain enforces, made unclickable here so nobody meets it as an
 * error message.
 */
export function PaymentFields({
  bankId,
  onBankChange,
  paymentMethod,
  onPaymentMethodChange,
  cardId,
  onCardChange,
  installments,
  onInstallmentsChange,
}: PaymentFieldsProps) {
  const fields = usePaymentFields(bankId, paymentMethod)

  return (
    <div className="space-y-4 border-t border-ink-border pt-4">
      {!fields.loading && !fields.hasBanks ? (
        <p className="text-xs text-ink-text-muted">
          Cadastre seus bancos em{' '}
          <Link href="/banks" className="text-accent hover:underline">
            Bancos e cartões
          </Link>{' '}
          para registrar por onde o dinheiro passou.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Banco"
          value={bankId}
          disabled={!fields.hasBanks}
          onChange={(event) => {
            onBankChange(event.target.value)
            // The card belonged to the previous bank; keeping it would file the
            // movement against a card of somewhere else.
            onCardChange('')
          }}
        >
          <option value="">Não informar</option>
          {fields.banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </Select>

        <Select
          label="Forma de pagamento"
          value={paymentMethod}
          onChange={(event) => {
            onPaymentMethodChange(event.target.value)
            if (event.target.value !== 'credit') onInstallmentsChange?.('1')
            if (event.target.value !== 'credit' && event.target.value !== 'debit') onCardChange('')
          }}
        >
          <option value="">Não informar</option>
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {fields.cardApplies && (
        <Select
          label="Cartão"
          value={cardId}
          disabled={!bankId}
          hint={
            !bankId
              ? 'Escolha o banco primeiro.'
              : fields.availableCards.length === 0
                ? 'Nenhum cartão deste banco aceita essa forma de pagamento.'
                : undefined
          }
          onChange={(event) => onCardChange(event.target.value)}
        >
          <option value="">Não informar</option>
          {fields.availableCards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name} ····{card.lastFourDigits}
            </option>
          ))}
        </Select>
      )}

      {fields.installmentsApply && installments !== undefined && onInstallmentsChange && (
        <Field
          label="Parcelas"
          type="number"
          min={1}
          max={48}
          value={installments}
          onChange={(event) => onInstallmentsChange(event.target.value)}
          // The amount typed is the TOTAL; the split is the backend's job, and
          // saying so here avoids the owner dividing it by hand first.
          error={undefined}
        />
      )}

      {fields.installmentsApply && Number(installments) > 1 && (
        <p className="text-xs text-ink-text-muted">
          O valor informado é o total da compra. Cada parcela entra em um mês, a partir da data do
          lançamento.
        </p>
      )}
    </div>
  )
}
