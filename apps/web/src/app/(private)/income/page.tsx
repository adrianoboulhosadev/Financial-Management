'use client'

import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { StatCard } from '@/components/stat-card'
import { useIncome } from './hooks/use-income'

export default function IncomePage() {
  const page = useIncome()

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <StatCard
          label="Renda mensal"
          accent="positive"
          value={<Amount cents={page.monthlyTotal} tone="income" />}
          hint="soma das fontes ativas"
        />

        {page.loading ? (
          <Loading compact />
        ) : page.sources.length === 0 ? (
          <EmptyState
            title="Nenhuma fonte de renda"
            description="Cadastre seu salário ao lado — é a base do cálculo de quanto sobra."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.sources.map((source) => (
              <li key={source.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${source.active ? '' : 'text-ink-text-muted line-through'}`}>
                    {source.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-text-muted">
                    todo dia {source.payday}
                    {!source.active && ' · pausada'}
                  </p>
                </div>

                <Amount
                  cents={source.amount}
                  tone={source.active ? 'income' : 'neutral'}
                  className="text-sm"
                />

                <button
                  type="button"
                  onClick={() => page.toggleActive(source)}
                  className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                >
                  {source.active ? 'Pausar' : 'Retomar'}
                </button>
                <button
                  type="button"
                  onClick={() => page.askToDelete(source)}
                  aria-label={`Excluir ${source.name}`}
                  className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (page.name.trim() && page.amount) page.create()
          }}
          className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
        >
          <h2 className="text-sm font-semibold">Nova fonte de renda</h2>
          <p className="text-xs leading-relaxed text-ink-text-soft">
            Isto é o que você recebe todo mês. Não vira lançamento — receita avulsa você registra em
            Lançamentos.
          </p>

          <Field
            label="Nome"
            placeholder="Salário, aluguel recebido…"
            value={page.name}
            onChange={(event) => page.setName(event.target.value)}
          />
          <Field
            label="Valor mensal (R$)"
            money
            placeholder="5.000,00"
            value={page.amount}
            onChange={(event) => page.setAmount(event.target.value)}
          />
          <Field
            label="Dia do recebimento"
            type="number"
            min={1}
            max={31}
            value={page.payday}
            onChange={(event) => page.setPayday(event.target.value)}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={page.creating || !page.name.trim() || !page.amount}
          >
            {page.creating ? 'Salvando…' : 'Adicionar'}
          </Button>
        </form>
      </aside>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title="Excluir fonte de renda"
        description="Se ela só parou de pagar, prefira pausar — assim o histórico do que era o plano continua."
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </div>
  )
}
