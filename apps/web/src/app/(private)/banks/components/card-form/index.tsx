'use client'

import type { CreateCardInput } from '@bank/adapters'
import { CARD_KIND_OPTIONS } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { useCardForm } from './hooks/use-card-form'

interface CardFormProps {
  bankId: string
  onSubmit: (input: CreateCardInput) => void
  onCancel: () => void
  submitting: boolean
}

/** Registering a card under one bank. It asks for four digits and nothing more:
 * that is enough to recognise the card on a statement, and it is not a number
 * anyone can spend. */
export function CardForm({ bankId, onSubmit, onCancel, submitting }: CardFormProps) {
  const form = useCardForm(bankId, onSubmit)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (form.canSubmit) form.submit()
      }}
      className="space-y-4 rounded-lg border border-ink-border bg-ink-bg p-4"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Nome do cartão"
          placeholder="Black, Conta corrente…"
          value={form.name}
          onChange={(event) => form.setName(event.target.value)}
        />
        <Select
          label="Tipo"
          value={form.kind}
          onChange={(event) => form.setKind(event.target.value)}
        >
          {CARD_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Field
          label="4 últimos dígitos"
          inputMode="numeric"
          placeholder="1234"
          value={form.lastFourDigits}
          onChange={(event) => form.setLastFourDigits(event.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !form.canSubmit}>
          {submitting ? 'Salvando…' : 'Salvar cartão'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
