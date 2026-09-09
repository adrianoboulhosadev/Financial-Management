import { Text, View } from 'react-native'
import { PAYMENT_METHOD_OPTIONS } from 'ui'
import { Field } from '@/components/field'
import { OptionPicker } from '@/components/option-picker'
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
 * Where the money went through and how — the phone's copy of the web's block,
 * with the SAME rules: a card only when one is being used, instalments only on
 * credit, and cards filtered by the bank AND by what they can pay with.
 *
 * The rules live in the shared hook, so the two fronts cannot drift apart on
 * what they offer; only the controls differ (sheets instead of `<select>`).
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
    <View className="gap-4 border-t border-ink-border pt-4">
      {!fields.loading && !fields.hasBanks ? (
        <Text className="text-xs text-ink-text-muted">
          Cadastre seus bancos em Mais › Bancos e cartões para registrar por onde o dinheiro passou.
        </Text>
      ) : null}

      <OptionPicker
        label="Banco"
        value={bankId}
        placeholder="Não informar"
        allowEmpty
        disabled={!fields.hasBanks}
        options={fields.banks.map((bank) => ({ value: bank.id, label: bank.name }))}
        onChange={(value) => {
          onBankChange(value)
          // The card belonged to the previous bank; keeping it would file the
          // movement against a card of somewhere else.
          onCardChange('')
        }}
      />

      <OptionPicker
        label="Forma de pagamento"
        value={paymentMethod}
        placeholder="Não informar"
        allowEmpty
        options={PAYMENT_METHOD_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        onChange={(value) => {
          onPaymentMethodChange(value)
          if (value !== 'credit') onInstallmentsChange?.('1')
          if (value !== 'credit' && value !== 'debit') onCardChange('')
        }}
      />

      {fields.cardApplies ? (
        <OptionPicker
          label="Cartão"
          value={cardId}
          placeholder="Não informar"
          allowEmpty
          disabled={!bankId}
          hint={
            !bankId
              ? 'Escolha o banco primeiro.'
              : fields.availableCards.length === 0
                ? 'Nenhum cartão deste banco aceita essa forma de pagamento.'
                : undefined
          }
          options={fields.availableCards.map((card) => ({
            value: card.id,
            label: `${card.name} ····${card.lastFourDigits}`,
          }))}
          onChange={onCardChange}
        />
      ) : null}

      {fields.installmentsApply && installments !== undefined && onInstallmentsChange ? (
        <Field
          label="Parcelas"
          keyboardType="number-pad"
          value={installments}
          onChangeText={onInstallmentsChange}
        />
      ) : null}

      {fields.installmentsApply && Number(installments) > 1 ? (
        <Text className="text-xs text-ink-text-muted">
          O valor informado é o total da compra. Cada parcela entra em um mês, a partir da data do
          lançamento.
        </Text>
      ) : null}
    </View>
  )
}
