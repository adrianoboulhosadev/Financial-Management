'use client'

import type { RecordTransactionInput } from '@transaction/adapters'
import { Button } from '@/components/button'
import { Chip } from '@/components/chip'
import { Field } from '@/components/field'
import { CategoryPicker } from '@/components/category-picker'
import { PaymentFields } from '@/components/payment-fields'
import { TRANSACTION_TYPES } from 'ui'
import { useTransactionForm } from './hooks/use-transaction-form'

interface TransactionFormProps {
  onSubmit: (input: RecordTransactionInput) => void
  submitting: boolean
}

export function TransactionForm({ onSubmit, submitting }: TransactionFormProps) {
  const {
    form,
    submit,
    type,
    categoryId,
    setCategoryId,
    categoryRequired,
    payment,
    setBankId,
    setPaymentMethod,
    setCardId,
    setInstallments,
  } = useTransactionForm(onSubmit)

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {TRANSACTION_TYPES.map((option) => (
          <Chip
            key={option.value}
            active={type === option.value}
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

      <PaymentFields
        bankId={payment.bankId}
        onBankChange={setBankId}
        paymentMethod={payment.paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cardId={payment.cardId}
        onCardChange={setCardId}
        installments={payment.installments}
        onInstallmentsChange={setInstallments}
      />

      <Button
        type="submit"
        className="w-full"
        // The category check is not part of react-hook-form (the picker owns its
        // own state), so the button enforces it too.
        disabled={submitting || (categoryRequired && !categoryId)}
      >
        {submitting ? 'Registrando…' : 'Registrar'}
      </Button>
    </form>
  )
}
