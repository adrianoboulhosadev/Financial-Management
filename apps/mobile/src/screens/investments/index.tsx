import { Pressable, Text, View } from 'react-native'
import { ACCENT, formatBRL, INVESTMENT_KIND_LABELS, INVESTMENT_KIND_OPTIONS, NEUTRAL } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { InvestLeftover } from '@/components/invest-leftover'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { OptionPicker } from '@/components/option-picker'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { InvestmentsIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { useInvestmentsScreen } from './hooks/use-investments-screen'

/**
 * What the owner put away to grow.
 *
 * The return is CALCULATED from what went in and what it is worth today, never
 * stored — which is what keeps the two figures from ever disagreeing — and it
 * is the only signed number in the product, because "quanto eu perdi" is
 * exactly what has to be visible.
 */
export function InvestmentsScreen() {
  const screen = useInvestmentsScreen()

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Investimentos"
            back
            action={
              <Pressable
                onPress={screen.openForm}
                accessibilityLabel="Novo investimento"
                hitSlop={10}
              >
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
          />
        }
      >
        <View className="gap-3 px-5 pt-1">
          {screen.loading || !screen.portfolio ? (
            <Loading compact />
          ) : (
            <>
              <Pane className="p-[18px]">
                <Kicker>Total aplicado</Kicker>
                <View className="mt-1.5 flex-row items-baseline gap-1.5">
                  <Text className="text-[15px] text-neutral-600">R$</Text>
                  <Amount
                    cents={screen.portfolio.valueCents}
                    className="text-[34px] font-medium tracking-tighter"
                  />
                </View>
                <Text
                  className={`mt-1.5 text-[11.5px] ${
                    screen.portfolio.returnCents < 0 ? 'text-negative' : 'text-positive'
                  }`}
                >
                  {`${screen.portfolio.returnCents >= 0 ? '+' : '−'}${formatBRL(
                    Math.abs(screen.portfolio.returnCents),
                  )} ${
                    screen.portfolio.returnCents < 0 ? 'de prejuízo' : 'de rendimento'
                  } · ${formatBRL(screen.portfolio.investedCents)} aplicados`}
                </Text>
              </Pane>

              {/* Deciding what to do with the leftover is the next thought after
                  reading it, not a separate errand. */}
              <InvestLeftover
                leftoverCents={screen.leftoverCents}
                investedCents={screen.investedThisMonthCents}
              />

              {screen.portfolio.byKind.length > 0 ? (
                <Pane className="px-[18px] py-4">
                  <Kicker>Onde está</Kicker>
                  <View className="mt-3 gap-4">
                    {screen.portfolio.byKind.map((slice) => (
                      <View key={slice.kind} className="gap-[7px]">
                        <View className="flex-row items-baseline gap-2">
                          <Text numberOfLines={1} className="flex-1 text-[13px] text-ink-text">
                            {INVESTMENT_KIND_LABELS[slice.kind]}
                          </Text>
                          <Amount
                            cents={slice.valueCents}
                            className="text-[11.5px] text-neutral-500"
                          />
                        </View>
                        {/* Share of the portfolio, so the list reads as a
                            composition and not just as numbers. */}
                        <View className="h-1.5 w-full overflow-hidden rounded-full bg-ink-border">
                          <View
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${
                                screen.portfolio!.valueCents === 0
                                  ? 0
                                  : Math.round(
                                      (slice.valueCents / screen.portfolio!.valueCents) * 100,
                                    )
                              }%`,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </Pane>
              ) : null}
            </>
          )}

          {!screen.loading && screen.investments.length === 0 ? (
            <EmptyState
              title="Nenhum investimento cadastrado"
              description="Cadastre o que você já aplicou para acompanhar quanto rendeu."
              action={<Button label="Cadastrar investimento" onPress={screen.openForm} />}
            />
          ) : (
            <Pane className="px-[18px] py-4">
              <Kicker>Seus investimentos</Kicker>
              <View className="mt-1.5">
                {screen.investments.map((investment, index) => {
                  const last = index === screen.investments.length - 1

                  return (
                    <View key={investment.id}>
                      <ListRow last={last && screen.editingId !== investment.id}>
                        <IconBadge
                          icon={InvestmentsIcon}
                          tone={investment.active ? 'accent' : 'muted'}
                        />

                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className={`text-[13px] ${
                              investment.active ? 'text-ink-text' : 'text-neutral-500 line-through'
                            }`}
                          >
                            {investment.name}
                          </Text>
                          <Text numberOfLines={1} className="mt-[3px] text-[11px] text-neutral-600">
                            {screen.captionFor(investment)}
                          </Text>
                          {screen.returnOf(investment) !== 0 ? (
                            <Amount
                              cents={screen.returnOf(investment)}
                              tone="movement"
                              signed
                              className="mt-0.5 text-[11px]"
                            />
                          ) : null}
                        </View>

                        <Amount
                          cents={investment.currentAmount ?? investment.investedAmount}
                          tone={investment.active ? 'neutral' : 'muted'}
                          className="text-[13px]"
                        />

                        <Pressable onPress={() => screen.startEditing(investment)} hitSlop={8}>
                          <Text className="text-[11px] text-accent-300">Atualizar</Text>
                        </Pressable>
                        <Pressable onPress={() => screen.toggleActive(investment)} hitSlop={8}>
                          <Text className="text-[11px] text-neutral-500">
                            {investment.active ? 'Resgatar' : 'Reativar'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => screen.askToDelete(investment)}
                          accessibilityLabel={`Excluir ${investment.name}`}
                          hitSlop={8}
                        >
                          <TrashIcon color={NEUTRAL[700]} size={16} />
                        </Pressable>
                      </ListRow>

                      {screen.editingId === investment.id ? (
                        <View
                          className={`gap-3 pb-4 ${last ? '' : 'border-b border-ink-border'}`}
                        >
                          <Field
                            label="Quanto vale hoje (R$)"
                            money
                            placeholder="0,00"
                            value={screen.draftValue}
                            onChangeText={screen.setDraftValue}
                          />
                          <Button
                            label="Salvar"
                            onPress={screen.confirmEditing}
                            disabled={!screen.draftValue}
                          />
                          <Button label="Cancelar" variant="ghost" onPress={screen.cancelEditing} />
                        </View>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            </Pane>
          )}
        </View>
      </Screen>

      <Sheet open={screen.formOpen} title="Novo investimento" onClose={screen.closeForm}>
        <Field
          label="Nome"
          placeholder="CDB Itaú 110%, Tesouro Selic 2029…"
          value={screen.name}
          onChangeText={screen.setName}
        />
        <OptionPicker
          label="Tipo"
          value={screen.kind}
          options={INVESTMENT_KIND_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={screen.setKind}
        />
        <OptionPicker
          label="Banco / corretora"
          value={screen.bankId}
          placeholder="Não informar"
          allowEmpty
          hint="Opcional — um investimento fora dos bancos cadastrados também entra na lista."
          options={screen.banks.map((bank) => ({ value: bank.id, label: bank.name }))}
          onChange={screen.setBankId}
        />
        <Field
          label="Valor aplicado (R$)"
          money
          placeholder="0,00"
          value={screen.investedAmount}
          onChangeText={screen.setInvestedAmount}
        />
        <Field
          label="Valor hoje (R$)"
          money
          placeholder="opcional"
          value={screen.currentAmount}
          onChangeText={screen.setCurrentAmount}
        />
        <Field
          label="Início (AAAA-MM-DD)"
          placeholder="2026-01-15"
          value={screen.startedOn}
          onChangeText={screen.setStartedOn}
        />
        <Field
          label="Vencimento (opcional)"
          placeholder="2028-01-15"
          value={screen.maturityOn}
          onChangeText={screen.setMaturityOn}
        />
        <Field
          label="Observações (opcional)"
          placeholder="110% do CDI, liquidez diária…"
          value={screen.notes}
          onChangeText={screen.setNotes}
        />

        <Button
          label={screen.creating ? 'Cadastrando…' : 'Cadastrar'}
          onPress={screen.submit}
          disabled={screen.creating || !screen.canSubmit}
        />
      </Sheet>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title="Excluir investimento"
        description={
          screen.pendingDeletion
            ? `"${screen.pendingDeletion.name}" sai da carteira e do histórico. Se ele só foi resgatado, prefira "Resgatar" — assim o registro fica.`
            : undefined
        }
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
