import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { StatCard } from '@/components/stat-card'
import { useIncomeScreen } from './hooks/use-income-screen'

export function IncomeScreen() {
  const screen = useIncomeScreen()

  return (
    <>
      <Screen>
        <StatCard
          label="Renda mensal"
          accent="positive"
          value={<Amount cents={screen.monthlyTotal} tone="income" className="text-2xl" />}
          hint="soma das fontes ativas"
        />

        <Button label="Nova fonte de renda" onPress={screen.openForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.sources.length === 0 ? (
          <EmptyState
            title="Nenhuma fonte de renda"
            description="Cadastre seu salário — é a base do cálculo de quanto sobra."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.sources.map((source, index) => (
              <View
                key={source.id}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  index > 0 ? 'border-t border-ink-border' : ''
                }`}
              >
                <View className="flex-1">
                  <Text
                    className={`text-sm font-medium ${source.active ? 'text-ink-text' : 'text-ink-text-muted line-through'}`}
                    numberOfLines={1}
                  >
                    {source.name}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-text-muted">
                    todo dia {source.payday}
                    {source.active ? '' : ' · pausada'}
                  </Text>
                </View>

                <Amount
                  cents={source.amount}
                  tone={source.active ? 'income' : 'neutral'}
                  className="text-sm"
                />

                <Pressable onPress={() => screen.toggleActive(source)} className="px-2 py-1">
                  <Text className="text-xs text-ink-text-muted">
                    {source.active ? 'Pausar' : 'Retomar'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => screen.askToDelete(source)} className="px-2 py-1">
                  <Text className="text-ink-text-muted">✕</Text>
                </Pressable>
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
            className="rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView contentContainerClassName="gap-4 p-4 pb-8" keyboardShouldPersistTaps="handled">
              <Text className="text-base font-semibold text-ink-text">Nova fonte de renda</Text>
              <Text className="text-xs leading-relaxed text-ink-text-soft">
                Isto é o que você recebe todo mês. Não vira lançamento — receita avulsa você registra
                em Lançamentos.
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
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
