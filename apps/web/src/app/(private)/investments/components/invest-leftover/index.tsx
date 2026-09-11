'use client'

import { formatBRL, formatPeriodShort, toPeriod } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Select } from '@/components/select'
import { InvestmentsIcon } from '@/data/icons'
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
 * has.
 *
 * The contribution comes OFF the leftover (see report/monthly), so the figure
 * above drops by exactly what was put away — which is what makes it
 * trustworthy the next time it is read.
 *
 * It is outlined in the accent rather than being another surface pane: it is
 * the one thing on this screen that asks for a decision, and everything around
 * it is a reading.
 */
export function InvestLeftover({ leftoverCents, investedCents }: InvestLeftoverProps) {
  const panel = useInvestLeftover(leftoverCents)
  const monthLabel = formatPeriodShort(toPeriod()).split(' ')[0]

  return (
    <div className="rounded-card border border-accent-800 px-[18px] py-4">
      <div className="flex items-center gap-3">
        <InvestmentsIcon size={20} className="flex-none text-accent-400" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] capitalize">Sobra livre de {monthLabel}</p>
          <p className="mt-[3px] text-[11.5px] tabular-nums text-neutral-600">
            {formatBRL(leftoverCents)}
            {investedCents > 0 && ` · já aportou ${formatBRL(investedCents)} neste mês`}
          </p>
        </div>
      </div>

      {!panel.open &&
        (panel.hasInvestments ? (
          <div className="mt-3.5 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => panel.openPanel(true)}
              // Nothing left to put away — the button would only lead to a
              // number the domain refuses.
              disabled={leftoverCents <= 0}
            >
              Aportar tudo
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => panel.openPanel()}
              disabled={leftoverCents <= 0}
            >
              Escolher valor
            </Button>
          </div>
        ) : (
          <p className="mt-3.5 text-[11.5px] text-neutral-600">
            Cadastre um investimento abaixo para poder aportar a sobra.
          </p>
        ))}

      {panel.open && (
        <div className="mt-3.5 flex flex-col gap-3.5 border-t border-ink-border pt-3.5">
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

          <p className="text-[10.5px] leading-relaxed text-neutral-600">
            O valor aportado sai da sobra e entra no investimento escolhido.
          </p>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={panel.submit}
              disabled={panel.contributing || !panel.canSubmit}
            >
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
