'use client'

import type { CreateBankInput } from '@bank/adapters'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { OTHER_BANK, useBankForm } from './hooks/use-bank-form'

interface BankFormProps {
  onSubmit: (input: CreateBankInput) => void
  submitting: boolean
}

/**
 * Registering a bank. A real `<select>` and NOT an `<input list>` + `<datalist>`:
 * a datalist is a typeahead, not a dropdown — it stays invisible until the
 * owner types, and whether clicking opens it at all differs per browser. A
 * field that looks like a picker and shows nothing when clicked reads as broken,
 * which is exactly what it was.
 *
 * "Outro" is the escape hatch that keeps the list a shortcut rather than a
 * limit: it reveals a text field, so a bank nobody listed is still registerable.
 */
export function BankForm({ onSubmit, submitting }: BankFormProps) {
  const form = useBankForm(onSubmit)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (form.canSubmit) form.submit()
      }}
      className="flex flex-col gap-4"
    >
      <Select
        label="Banco"
        value={form.selected}
        onChange={(event) => form.setSelected(event.target.value)}
      >
        <option value="">Selecione…</option>
        {form.suggestions.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
        <option value={OTHER_BANK}>Outro (digitar o nome)</option>
      </Select>

      {form.choosingOther && (
        <Field
          label="Nome do banco"
          placeholder="Como ele aparece pra você"
          autoFocus
          value={form.customName}
          onChange={(event) => form.setCustomName(event.target.value)}
        />
      )}

      <div className="flex flex-col gap-4">
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
