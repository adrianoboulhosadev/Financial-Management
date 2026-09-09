'use client'

import Link from 'next/link'
import { formatBRL } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { useInvestLeftover } from './hooks/use-invest-leftover'

interface InvestLeftoverProps {
  /** What the month still has free, in cents. */
  leftoverCents: number
  /** What already went into investments this month — shown so the owner can see
   * the leftover already reflects it. */
  investedCents: number
}

/**
 * Putting part of the month's leftover into an investment the owner already
 * has. It sits on the dashboard because that is where the leftover is read:
 * deciding what to do with it is the next thought, not a separate errand.
 *
 * The contribution comes OFF the leftover (see report/monthly), so the number
 * above it drops by exactly what was put away — which is what makes the figure
 * trustworthy the next time it is read.
 */
export function InvestLeftover({ leftoverCents, investedCents }: InvestLeftoverProps) {
  const panel = useInvestLeftover()

  return (
    <div className="space-y-3 border-t border-ink-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-text-soft">
          {investedCents > 0
            ? `${formatBRL(investedCents)} já investidos neste mês.`
            : 'Sobrou dinheiro no mês? Guarde parte dele.'}
        </p>

        {!panel.open &&
          (panel.hasInvestments ? (
            <Button
              variant="secondary"
              onClick={panel.openPanel}
              // Nothing left to put away — the button would only lead to a
              // number the domain refuses.
              disabled={leftoverCents <= 0}
            >
              Investir a sobra
            </Button>
          ) : (
            <Link href="/investments" className="text-sm text-accent hover:underline">
              Cadastrar um investimento
            </Link>
          ))}
      </div>

      {panel.open && (
        <div className="space-y-4 rounded-lg border border-ink-border bg-ink-bg p-4">
          <Select
            label="Investimento"
            value={panel.investmentId}
            onChange={(event) => panel.setInvestmentId(event.target.value)}
          >
            <option value="">Selecione…</option>
            {panel.options.map((investment) => (
              <option key={investment.id} value={investment.id}>
                {investment.name}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Quanto vai investir (R$)"
              money
              placeholder="0,00"
              value={panel.amount}
              onChange={(event) => panel.setAmount(event.target.value)}
            />
            <Field
              label="Data"
              type="date"
              value={panel.occurredOn}
              onChange={(event) => panel.setOccurredOn(event.target.value)}
            />
          </div>

          <p className="text-xs text-ink-text-muted">
            Sobram {formatBRL(leftoverCents)} neste mês. O valor aportado sai da sobra e entra no
            investimento escolhido.
          </p>

          <div className="flex gap-2">
            <Button onClick={panel.submit} disabled={panel.contributing || !panel.canSubmit}>
              {panel.contributing ? 'Registrando…' : 'Investir'}
            </Button>
            <Button variant="ghost" onClick={panel.close}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
