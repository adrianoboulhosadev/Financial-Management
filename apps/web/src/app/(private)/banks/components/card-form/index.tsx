'use client'

import type { CardDTO, CreateCardInput, UpdateCardInput } from '@bank/adapters'
import { CARD_BRAND_OPTIONS, CARD_KIND_OPTIONS } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { useCardForm } from './hooks/use-card-form'

interface CardFormProps {
  bankId: string
  onCreate: (input: CreateCardInput) => void
  onUpdate: (input: UpdateCardInput & { id: string }) => void
  /** The card being edited, or null to register a new one. */
  editing: CardDTO | null
  onCancel: () => void
  submitting: boolean
}

/**
 * Registering or editing a card under one bank. Brand, kind and four digits —
 * no nickname: "Visa ····1234" is how the card reads on a statement, and asking
 * someone to invent a name for their own card is a field with no answer.
 *
 * The invoice block only appears on a card that settles on CREDIT, which is the
 * same rule the entity applies: a debit card has nothing to close and no limit
 * to spend against, so offering the fields would only get them refused.
 */
export function CardForm({ bankId, onCreate, onUpdate, editing, onCancel, submitting }: CardFormProps) {
  const form = useCardForm({ bankId, onCreate, onUpdate, editing })

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

        {form.onCredit && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Fecha dia"
                inputMode="numeric"
                placeholder="11"
                value={form.closingDay}
                onChange={(event) => form.setClosingDay(event.target.value)}
              />
              <Field
                label="Vence dia"
                inputMode="numeric"
                placeholder="18"
                value={form.dueDay}
                onChange={(event) => form.setDueDay(event.target.value)}
              />
            </div>
            <Field
              label="Limite (opcional)"
              money
              placeholder="0,00"
              value={form.limit}
              onChange={(event) => form.setLimit(event.target.value)}
            />
            <p className="-mt-1 text-[11px] leading-[1.5] text-neutral-600">
              Com os dois dias preenchidos, a fatura do cartão aparece aqui na lista. O limite é
              opcional — sem ele a fatura continua sendo mostrada, só não vira barra.
            </p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || !form.canSubmit}>
          {submitting ? 'Salvando…' : form.editing ? 'Salvar alterações' : 'Salvar cartão'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
