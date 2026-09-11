'use client'

import type { CreateCardInput } from '@bank/adapters'
import { CARD_BRAND_OPTIONS, CARD_KIND_OPTIONS } from 'ui'
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

/**
 * Registering a card under one bank. Brand, kind and four digits — no nickname:
 * "Visa ····1234" is how the card reads on a statement, and asking someone to
 * invent a name for their own card is a field with no answer.
 */
export function CardForm({ bankId, onSubmit, onCancel, submitting }: CardFormProps) {
  const form = useCardForm(bankId, onSubmit)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (form.canSubmit) form.submit()
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Bandeira"
          value={form.brand}
          onChange={(event) => form.setBrand(event.target.value)}
        >
          {CARD_BRAND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
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
