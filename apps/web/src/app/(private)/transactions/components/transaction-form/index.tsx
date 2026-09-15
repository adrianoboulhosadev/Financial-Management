'use client'

import type {
  RecordTransactionInput,
  TransactionDTO,
  UpdateTransactionInput,
} from '@transaction/adapters'
import { TRANSACTION_TYPES } from 'ui'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { Chip } from '@/components/chip'
import { Field } from '@/components/field'
import { PaymentFields } from '@/components/payment-fields'
import { ReceiptField } from '../receipt-field'
import { useTransactionForm } from './hooks/use-transaction-form'

interface TransactionFormProps {
  onCreate: (input: RecordTransactionInput) => void
  onUpdate: (input: UpdateTransactionInput & { id: string }) => void
  /** The movement being corrected, or null to record a new one. */
  editing: TransactionDTO | null
  submitting: boolean
}

export function TransactionForm({
  onCreate,
  onUpdate,
  editing,
  submitting,
}: TransactionFormProps) {
  const {
    form,
    submit,
    type,
    isEditing,
    categoryId,
    setCategoryId,
    categoryRequired,
    payment,
    setBankId,
    setPaymentMethod,
    setCardId,
    setInstallments,
    attachmentUrl,
    attachReceipt,
    removeReceipt,
    uploading,
  } = useTransactionForm({ onCreate, onUpdate, editing })

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* The direction is fixed once recorded: `UpdateTransaction` takes no
          `type`, so editing shows which one it is instead of offering a switch
          the domain would refuse. */}
      <div className="flex gap-1.5">
        {TRANSACTION_TYPES.map((option) => (
          <Chip
            key={option.value}
            active={type === option.value}
            disabled={isEditing}
            onClick={() => form.setValue('type', option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      <Field
        label="Descrição"
        placeholder="Mercado, cinema, conta de luz…"
        {...form.register('description', { required: 'Descreva o lançamento.' })}
        error={form.formState.errors.description?.message}
      />

      <div className="flex flex-col gap-4">
        <Field
          label="Valor (R$)"
          money
          placeholder="0,00"
          {...form.register('amount', {
            required: 'Informe o valor.',
            validate: (value) =>
              Number(value.replace(',', '.')) > 0 || 'O valor precisa ser maior que zero.',
          })}
          error={form.formState.errors.amount?.message}
        />
        <Field
          label="Data"
          type="date"
          {...form.register('occurredOn', { required: 'Informe a data.' })}
          error={form.formState.errors.occurredOn?.message}
        />
      </div>

      <CategoryPicker
        value={categoryId}
        onChange={setCategoryId}
        allowEmpty={!categoryRequired}
        error={
          categoryRequired && form.formState.isSubmitted && !categoryId
            ? 'Toda despesa precisa de uma categoria.'
            : undefined
        }
      />

      <ReceiptField
        url={attachmentUrl}
        onPick={attachReceipt}
        onRemove={removeReceipt}
        uploading={uploading}
      />

      <PaymentFields
        bankId={payment.bankId}
        onBankChange={setBankId}
        paymentMethod={payment.paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cardId={payment.cardId}
        onCardChange={setCardId}
        // The split is fixed at creation — turning a 6x into a 3x is a different
        // set of rows, not a different value on one of them.
        installments={isEditing ? undefined : payment.installments}
        onInstallmentsChange={isEditing ? undefined : setInstallments}
      />

      {isEditing && Number(payment.installments) > 1 && (
        <p className="text-[10.5px] leading-relaxed text-neutral-600">
          Esta é a parcela {editing?.installmentNumber} de {payment.installments}. O parcelamento
          não muda na edição — para refazê-lo, exclua e lance de novo.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        // The category check is not part of react-hook-form (the picker owns its
        // own state), so the button enforces it too.
        disabled={submitting || uploading || (categoryRequired && !categoryId)}
      >
        {submitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Registrar'}
      </Button>
    </form>
  )
}
