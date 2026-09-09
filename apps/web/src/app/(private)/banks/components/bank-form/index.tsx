'use client'

import type { CreateBankInput } from '@bank/adapters'
import { BANK_SUGGESTIONS } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { useBankForm } from './hooks/use-bank-form'

interface BankFormProps {
  onSubmit: (input: CreateBankInput) => void
  submitting: boolean
}

/**
 * Registering a bank. The name field is a plain input backed by a `<datalist>`
 * rather than a `<select>`: the suggestions spare the owner from typing
 * "Bradesco", and a bank nobody listed is still typeable — which a closed
 * dropdown would make impossible.
 */
export function BankForm({ onSubmit, submitting }: BankFormProps) {
  const form = useBankForm(onSubmit)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (form.canSubmit) form.submit()
      }}
      className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
    >
      <h2 className="text-sm font-semibold">Novo banco</h2>

      <Field
        label="Banco"
        placeholder="Itaú, Nubank…"
        list="bank-suggestions"
        value={form.name}
        onChange={(event) => form.setName(event.target.value)}
      />
      <datalist id="bank-suggestions">
        {BANK_SUGGESTIONS.map((bank) => (
          <option key={bank} value={bank} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Agência (opcional)"
          placeholder="0001"
          value={form.agency}
          onChange={(event) => form.setAgency(event.target.value)}
        />
        <Field
          label="Conta (opcional)"
          placeholder="12345-6"
          value={form.accountNumber}
          onChange={(event) => form.setAccountNumber(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !form.canSubmit}>
        {submitting ? 'Cadastrando…' : 'Cadastrar banco'}
      </Button>
    </form>
  )
}
