import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { INVESTMENT_KIND_LABELS, INVESTMENT_KIND_OPTIONS, formatBRL, formatDate } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { OptionPicker } from '@/components/option-picker'
import { Screen } from '@/components/screen'
import { StatCard } from '@/components/stat-card'
import { useInvestmentsScreen } from './hooks/use-investments-screen'

/**
 * What the owner put away to grow. Same three headline figures as the web's,
 * and the last one — the return — is the only signed number in the product,
 * because "quanto eu perdi" is exactly what has to be visible.
 */
export function InvestmentsScreen() {
  const screen = useInvestmentsScreen()

  return (
    <>
      <Screen>
        {screen.loading || !screen.portfolio ? (
          <Loading compact />
        ) : (
          <>
            <View className="gap-3">
              <StatCard
                label="Aplicado"
                value={
                  <Amount cents={screen.portfolio.investedCents} className="text-2xl" />
                }
                hint="tudo que você colocou"
              />
              <StatCard
                label="Hoje"
                accent="accent"
                value={<Amount cents={screen.portfolio.valueCents} className="text-2xl" />}
                hint="valor atual da carteira"
              />
              <StatCard
                label="Rendimento"
                accent={screen.portfolio.returnCents < 0 ? 'negative' : 'positive'}
                value={
                  <Amount
                    cents={screen.portfolio.returnCents}
                    tone="movement"
                    signed
                    className="text-2xl"
                  />
                }
                hint={
                  screen.portfolio.returnCents < 0 ? 'no vermelho' : 'o que rendeu até agora'
                }
              />
            </View>

            {screen.portfolio.byKind.length > 0 ? (
              <View className="gap-3 rounded-card border border-ink-border bg-ink-surface p-4">
                <Text className="text-sm font-semibold text-ink-text">Onde está o dinheiro</Text>
                {screen.portfolio.byKind.map((slice) => (
                  <View key={slice.kind} className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-sm text-ink-text-soft" numberOfLines={1}>
                        {INVESTMENT_KIND_LABELS[slice.kind]}
                      </Text>
                      <Amount cents={slice.valueCents} className="text-sm" />
                    </View>
                    {/* Share of the portfolio, so the list reads as a
                        composition and not just as numbers. */}
                    <View className="h-1.5 w-full overflow-hidden rounded-full bg-ink-surface-soft">
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
            ) : null}
          </>
        )}

        <Button label="Novo investimento" onPress={screen.openForm} />

        {!screen.loading && screen.investments.length === 0 ? (
          <EmptyState
            title="Nenhum investimento cadastrado"
            description="Toque em Novo investimento para acompanhar quanto o seu dinheiro rendeu."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.investments.map((investment, index) => (
              <View
                key={investment.id}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-ink-border' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${investment.active ? 'text-ink-text' : 'text-ink-text-muted line-through'}`}
                      numberOfLines={1}
                    >
                      {investment.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
                      {[
                        INVESTMENT_KIND_LABELS[investment.kind],
                        screen.bankNameOf(investment.bankId),
                        `desde ${formatDate(investment.startedOn)}`,
                        !investment.active && 'resgatado',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Amount
                      cents={investment.currentAmount ?? investment.investedAmount}
                      className="text-sm"
                    />
                    <Text className="mt-0.5 text-xs text-ink-text-muted">
                      aplicou {formatBRL(investment.investedAmount)}
                    </Text>
                    {screen.returnOf(investment) !== 0 ? (
                      <Amount
                        cents={screen.returnOf(investment)}
                        tone="movement"
                        signed
                        className="mt-0.5 text-xs"
                      />
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => screen.askToDelete(investment)}
                    accessibilityLabel={`Excluir ${investment.name}`}
                    className="px-2 py-1"
                  >
                    <Text className="text-ink-text-muted">✕</Text>
                  </Pressable>
                </View>

                {screen.editingId === investment.id ? (
                  <View className="mt-3 gap-3 border-t border-ink-border pt-3">
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
                ) : (
                  <View className="mt-2 flex-row gap-2">
                    <Button
                      label="Atualizar valor"
                      variant="secondary"
                      className="flex-1"
                      onPress={() => screen.startEditing(investment)}
                    />
                    <Button
                      label={investment.active ? 'Resgatar' : 'Reativar'}
                      variant="ghost"
                      className="flex-1"
                      onPress={() => screen.toggleActive(investment)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Screen>

      <Modal
        visible={screen.formOpen}
        transparent
        animationType="slide"
        onRequestClose={screen.closeForm}
      >
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={screen.closeForm}>
          <Pressable
            className="max-h-[88%] rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView
              contentContainerClassName="gap-4 p-4 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-base font-semibold text-ink-text">Novo investimento</Text>

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
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
