'use client'

import type { CreateInvestmentInput } from '@investment/adapters'
import { INVESTMENT_KIND_OPTIONS, useBanks } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { useInvestmentForm } from './hooks/use-investment-form'

interface InvestmentFormProps {
  onSubmit: (input: CreateInvestmentInput) => void
  submitting: boolean
}

export function InvestmentForm({ onSubmit, submitting }: InvestmentFormProps) {
  const form = useInvestmentForm(onSubmit)
  // The one exception the rule allows: an isolated third-party hook call with
  // no state or handler of its own beside it.
  const { banks } = useBanks()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (form.canSubmit) form.submit()
      }}
      className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
    >
      <h2 className="text-sm font-semibold">Novo investimento</h2>

      <Field
        label="Nome"
        placeholder="CDB Itaú 110%, Tesouro Selic 2029…"
        value={form.fields.name}
        onChange={(event) => form.patch({ name: event.target.value })}
      />

      <Select
        label="Tipo"
        value={form.fields.kind}
        onChange={(event) => form.patch({ kind: event.target.value })}
      >
        {INVESTMENT_KIND_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        label="Banco / corretora"
        value={form.fields.bankId}
        onChange={(event) => form.patch({ bankId: event.target.value })}
        hint="Opcional — um investimento fora dos bancos cadastrados também entra na lista."
      >
        <option value="">Não informar</option>
        {banks.map((bank) => (
          <option key={bank.id} value={bank.id}>
            {bank.name}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Valor aplicado (R$)"
          money
          placeholder="0,00"
          value={form.fields.investedAmount}
          onChange={(event) => form.patch({ investedAmount: event.target.value })}
        />
        <Field
          label="Valor hoje (R$)"
          money
          placeholder="opcional"
          value={form.fields.currentAmount}
          onChange={(event) => form.patch({ currentAmount: event.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Início"
          type="date"
          value={form.fields.startedOn}
          onChange={(event) => form.patch({ startedOn: event.target.value })}
        />
        <Field
          label="Vencimento (opcional)"
          type="date"
          value={form.fields.maturityOn}
          onChange={(event) => form.patch({ maturityOn: event.target.value })}
        />
      </div>

      <Field
        label="Observações (opcional)"
        placeholder="110% do CDI, liquidez diária…"
        value={form.fields.notes}
        onChange={(event) => form.patch({ notes: event.target.value })}
      />

      <Button type="submit" className="w-full" disabled={submitting || !form.canSubmit}>
        {submitting ? 'Cadastrando…' : 'Cadastrar'}
      </Button>
    </form>
  )
}
