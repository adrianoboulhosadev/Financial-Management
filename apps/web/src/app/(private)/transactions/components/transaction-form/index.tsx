'use client'

import type { RecordTransactionInput } from '@transaction/adapters'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { CategoryPicker } from '@/components/category-picker'
import { TRANSACTION_TYPES } from 'ui'
import { useTransactionForm } from './hooks/use-transaction-form'

interface TransactionFormProps {
  onSubmit: (input: RecordTransactionInput) => void
  submitting: boolean
}

export function TransactionForm({ onSubmit, submitting }: TransactionFormProps) {
  const { form, submit, type, categoryId, setCategoryId, categoryRequired } =
    useTransactionForm(onSubmit)

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
    >
      <h2 className="text-sm font-semibold">Novo lançamento</h2>

      <div className="inline-flex rounded-lg border border-ink-border p-1">
        {TRANSACTION_TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => form.setValue('type', option.value)}
            className={`rounded px-4 py-1.5 text-sm transition-colors ${
              type === option.value
                ? option.value === 'expense'
                  ? 'bg-negative/15 text-negative'
                  : 'bg-positive/15 text-positive'
                : 'text-ink-text-muted hover:text-ink-text'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Field
        label="Descrição"
        placeholder="Mercado, cinema, conta de luz…"
        {...form.register('description', { required: 'Descreva o lançamento.' })}
        error={form.formState.errors.description?.message}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Valor (R$)"
          money
          placeholder="0,00"
          {...form.register('amount', {
            required: 'Informe o valor.',
            validate: (value) => Number(value.replace(',', '.')) > 0 || 'O valor precisa ser maior que zero.',
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
