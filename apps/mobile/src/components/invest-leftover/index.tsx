import { Text, View } from 'react-native'
import { formatBRL } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { OptionPicker } from '@/components/option-picker'
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
 * The contribution comes OFF the leftover (see report/monthly), so the number
 * above it drops by exactly what was put away.
 */
export function InvestLeftover({ leftoverCents, investedCents }: InvestLeftoverProps) {
  const panel = useInvestLeftover()

  return (
    <View className="gap-3 border-t border-ink-border pt-4">
      <Text className="text-sm text-ink-text-soft">
        {investedCents > 0
          ? `${formatBRL(investedCents)} já investidos neste mês.`
          : 'Sobrou dinheiro no mês? Guarde parte dele.'}
      </Text>

      {!panel.open ? (
        panel.hasInvestments ? (
          <Button
            label="Investir a sobra"
            variant="secondary"
            onPress={panel.openPanel}
            // Nothing left to put away — the button would only lead to a number
            // the domain refuses.
            disabled={leftoverCents <= 0}
          />
        ) : (
          <Text className="text-xs text-ink-text-muted">
            Cadastre um investimento em Mais › Investimentos para poder aportar aqui.
          </Text>
        )
      ) : (
        <View className="gap-4 rounded-lg border border-ink-border bg-ink-bg p-4">
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

          <Text className="text-xs text-ink-text-muted">
            Sobram {formatBRL(leftoverCents)} neste mês. O valor aportado sai da sobra e entra no
            investimento escolhido.
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
