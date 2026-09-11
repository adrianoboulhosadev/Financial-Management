import { Text, View } from 'react-native'
import { ACCENT, formatBRL, formatPeriodShort, toPeriod } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { OptionPicker } from '@/components/option-picker'
import { InvestmentsIcon } from '@/data/icons'
import { useInvestLeftover } from './hooks/use-invest-leftover'

interface InvestLeftoverProps {
  /** What the month still has free, in cents. */
  leftoverCents: number
  /** What already went into investments this month. */
  investedCents: number
}

/**
 * Putting part of the month's leftover into an investment the owner already
 * has — the phone's copy of the web's panel, sharing its hook so the two cannot
 * drift on what they offer or on what counts as a valid contribution.
 *
 * The contribution comes OFF the leftover (see report/monthly), so the figure
 * above drops by exactly what was put away.
 *
 * It is outlined in the accent rather than being another surface pane: it is
 * the one thing on this screen that asks for a decision.
 */
export function InvestLeftover({ leftoverCents, investedCents }: InvestLeftoverProps) {
  const panel = useInvestLeftover(leftoverCents)
  const monthLabel = formatPeriodShort(toPeriod()).split(' ')[0]

  return (
    <View className="rounded-card border border-accent-800 px-[18px] py-4">
      <View className="flex-row items-center gap-3">
        <InvestmentsIcon color={ACCENT[400]} size={20} />
        <View className="flex-1">
          <Text className="text-[13px] capitalize text-ink-text">{`Sobra livre de ${monthLabel}`}</Text>
          <Text className="mt-[3px] text-[11.5px] text-neutral-600">
            {formatBRL(leftoverCents)}
            {investedCents > 0 ? ` · já aportou ${formatBRL(investedCents)} neste mês` : ''}
          </Text>
        </View>
      </View>

      {!panel.open ? (
        panel.hasInvestments ? (
          <View className="mt-3.5 flex-row gap-2">
            <Button
              label="Aportar tudo"
              className="flex-1"
              onPress={() => panel.openPanel(true)}
              // Nothing left to put away — the button would only lead to a
              // number the domain refuses.
              disabled={leftoverCents <= 0}
            />
            <Button
              label="Escolher valor"
              variant="secondary"
              className="flex-1"
              onPress={() => panel.openPanel()}
              disabled={leftoverCents <= 0}
            />
          </View>
        ) : (
          <Text className="mt-3.5 text-[11.5px] text-neutral-600">
            Cadastre um investimento abaixo para poder aportar a sobra.
          </Text>
        )
      ) : (
        <View className="mt-3.5 gap-3.5 border-t border-ink-border pt-3.5">
          <OptionPicker
            label="Investimento"
            value={panel.investmentId}
            options={panel.options.map((investment) => ({
              value: investment.id,
              label: investment.name,
            }))}
            onChange={panel.setInvestmentId}
          />
          <Field
            label="Quanto vai investir (R$)"
            money
            placeholder="0,00"
            value={panel.amount}
            onChangeText={panel.setAmount}
          />
          <Field
            label="Data (AAAA-MM-DD)"
            value={panel.occurredOn}
            onChangeText={panel.setOccurredOn}
          />

          <Text className="text-[10.5px] leading-relaxed text-neutral-600">
            O valor aportado sai da sobra e entra no investimento escolhido.
          </Text>

          <Button
            label={panel.contributing ? 'Registrando…' : 'Investir'}
            onPress={panel.submit}
            disabled={panel.contributing || !panel.canSubmit}
          />
          <Button label="Cancelar" variant="ghost" onPress={panel.close} />
        </View>
      )}
    </View>
  )
}
