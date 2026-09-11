import { Pressable, Text, View } from 'react-native'
import { ACCENT, formatBRL, formatPeriodShort, NEUTRAL, toPeriod } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthBars } from '@/components/month-bars'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { ArrowInIcon, BanksIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { useIncomeScreen } from './hooks/use-income-screen'

/**
 * What comes in: the sources that repeat, and the one-offs that did not.
 *
 * A source generates NO transaction — it is the plan, not the money — which is
 * what keeps it from double-counting against a salary the owner also recorded
 * by hand. The two halves are shown side by side for exactly that reason.
 */
export function IncomeScreen() {
  const screen = useIncomeScreen()
  const monthLabel = formatPeriodShort(toPeriod()).split(' ')[0]

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Renda"
            action={
              <Pressable
                onPress={screen.openForm}
                accessibilityLabel="Nova fonte de renda"
                hitSlop={10}
              >
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
          />
        }
      >
        <View className="gap-3 px-5 pt-1">
          <Pane className="p-[18px]">
            <Kicker className="capitalize">{`Entrou em ${monthLabel}`}</Kicker>
            <View className="mt-1.5 flex-row items-baseline gap-1.5">
              <Text className="text-[15px] text-neutral-600">R$</Text>
              <Amount
                cents={screen.totalCents}
                tone="income"
                className="text-[34px] font-medium tracking-tighter"
              />
            </View>

            {screen.totalCents > 0 ? (
              <>
                <View className="mt-4 h-1.5 flex-row gap-0.5 overflow-hidden rounded-full">
                  <View
                    className="bg-positive"
                    style={{ width: `${(screen.monthlyTotal / screen.totalCents) * 100}%` }}
                  />
                  <View
                    className="bg-accent"
                    style={{ width: `${(screen.realizedCents / screen.totalCents) * 100}%` }}
                  />
                </View>

                <View className="mt-2.5 flex-row gap-[18px]">
                  <View className="flex-row items-center gap-[7px]">
                    <View className="h-[7px] w-[7px] rounded-sm bg-positive" />
                    <Text className="text-[11.5px] text-neutral-500">
                      Fixa {formatBRL(screen.monthlyTotal)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-[7px]">
                    <View className="h-[7px] w-[7px] rounded-sm bg-accent" />
                    <Text className="text-[11.5px] text-neutral-500">
                      Avulsa {formatBRL(screen.realizedCents)}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </Pane>

          {screen.loading ? (
            <Loading compact />
          ) : screen.sources.length === 0 ? (
            <EmptyState
              title="Nenhuma fonte de renda"
              description="Cadastre seu salário — é a base do cálculo de quanto sobra no mês."
              action={<Button label="Cadastrar renda" onPress={screen.openForm} />}
            />
          ) : (
            <Pane className="px-[18px] py-4">
              <Kicker>Renda fixa</Kicker>
              <View className="mt-1.5">
                {screen.sources.map((source, index) => (
                  <ListRow key={source.id} last={index === screen.sources.length - 1}>
                    <IconBadge icon={BanksIcon} tone={source.active ? 'accent' : 'muted'} />

                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] ${
                          source.active ? 'text-ink-text' : 'text-neutral-500 line-through'
                        }`}
                      >
                        {source.name}
                      </Text>
                      <Text numberOfLines={1} className="mt-[3px] text-[11px] text-neutral-600">
                        {screen.sourceCaptionFor(source)}
                      </Text>
                    </View>

                    <Amount
                      cents={source.amount}
                      tone={source.active ? 'income' : 'muted'}
                      className="text-[13px]"
                    />

                    <Pressable onPress={() => screen.toggleActive(source)} hitSlop={8}>
                      <Text className="text-[11px] text-accent-300">
                        {source.active ? 'Pausar' : 'Retomar'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => screen.askToDelete(source)}
                      accessibilityLabel={`Excluir ${source.name}`}
                      hitSlop={8}
                    >
                      <TrashIcon color={NEUTRAL[700]} size={16} />
                    </Pressable>
                  </ListRow>
                ))}
              </View>
            </Pane>
          )}

          {screen.oneOffs.length > 0 ? (
            <Pane className="px-[18px] py-4">
              <Kicker>Avulsos do mês</Kicker>
              <View className="mt-1.5">
                {screen.oneOffs.map((transaction, index) => (
                  <ListRow key={transaction.id} last={index === screen.oneOffs.length - 1}>
                    <IconBadge icon={ArrowInIcon} tone="income" />
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-[13px] text-ink-text">
                        {transaction.description}
                      </Text>
                      <Text numberOfLines={1} className="mt-[3px] text-[11px] text-neutral-600">
                        {screen.oneOffCaptionFor(transaction)}
                      </Text>
                    </View>
                    <Amount cents={transaction.amount} tone="income" className="text-[13px]" />
                  </ListRow>
                ))}
              </View>
            </Pane>
          ) : null}

          <Pane className="px-[18px] py-4">
            <Kicker>Média dos últimos 6 meses</Kicker>
            <View className="mt-3.5">
              <MonthBars bars={screen.history} />
            </View>
            <Text className="mt-2.5 text-[11.5px] text-neutral-600">
              {`média ${formatBRL(screen.averageCents)}`}
              {screen.versusAverage !== null && screen.versusAverage !== 0
                ? ` · ${monthLabel} está ${Math.abs(screen.versusAverage)}% ${
                    screen.versusAverage > 0 ? 'acima' : 'abaixo'
                  }`
                : ''}
            </Text>
          </Pane>
        </View>
      </Screen>

      <Sheet open={screen.formOpen} title="Nova fonte de renda" onClose={screen.closeForm}>
        <Text className="text-[11.5px] leading-relaxed text-neutral-600">
          Isto é o que você recebe todo mês. Não vira lançamento — receita avulsa você registra em
          Lançamentos.
        </Text>

        <Field
          label="Nome"
          placeholder="Salário, aluguel recebido…"
          value={screen.name}
          onChangeText={screen.setName}
        />
        <Field
          label="Valor mensal (R$)"
          money
          placeholder="5.000,00"
          value={screen.amount}
          onChangeText={screen.setAmount}
        />
        <Field
          label="Dia do recebimento"
          keyboardType="number-pad"
          value={screen.payday}
          onChangeText={screen.setPayday}
        />

        <Button
          label={screen.creating ? 'Salvando…' : 'Adicionar'}
          onPress={screen.submit}
          disabled={screen.creating || !screen.canSubmit}
        />
      </Sheet>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title="Excluir fonte de renda"
        description="Se ela só parou de pagar, prefira pausar — assim o histórico do que era o plano continua."
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
