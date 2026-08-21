import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Screen } from '@/components/screen'
import { useBudgetsScreen } from './hooks/use-budgets-screen'

export function BudgetsScreen() {
  const screen = useBudgetsScreen()

  return (
    <>
      <Screen>
        <MonthPicker period={screen.period} onChange={screen.setPeriod} />
        <Button label="Definir orçamento" onPress={screen.openForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.usages.length === 0 ? (
          <EmptyState
            title="Nenhum orçamento definido"
            description="Escolha uma categoria e diga quanto você quer gastar por mês nela."
          />
        ) : (
          screen.usages.map((usage) => (
            <View
              key={usage.budgetId}
              className="gap-2.5 rounded-card border border-ink-border bg-ink-surface p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-medium text-ink-text" numberOfLines={1}>
                  {screen.labelFor(usage.categoryId)}
                </Text>
                <Pressable onPress={() => screen.askToDelete(usage)} className="px-2">
                  <Text className="text-xs text-ink-text-muted">Remover</Text>
                </Pressable>
              </View>

              <BudgetBar percentage={usage.percentage} status={usage.status} />

              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-ink-text-muted">
                  {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)} ·{' '}
                  {usage.percentage}%
                </Text>
                {usage.remainingCents >= 0 ? (
                  <Text className="text-xs text-ink-text-muted">
                    Restam {formatBRL(usage.remainingCents)}
                  </Text>
                ) : (
                  <Text className="text-xs text-negative">
                    {formatBRL(-usage.remainingCents)} acima do teto
                  </Text>
                )}
              </View>
            </View>
          ))
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
              <Text className="text-base font-semibold text-ink-text">Definir orçamento</Text>
              <Text className="text-xs leading-relaxed text-ink-text-soft">
                O teto vale para todo mês. Definir de novo a mesma categoria ajusta o valor.
              </Text>

              <CategoryPicker value={screen.categoryId} onChange={screen.setCategoryId} />
              <Field
                label="Teto mensal (R$)"
                money
                placeholder="500,00"
                value={screen.amount}
                onChangeText={screen.setAmount}
              />

              <Button
                label={screen.saving ? 'Salvando…' : 'Salvar'}
                onPress={screen.submit}
                disabled={screen.saving || !screen.canSubmit}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title="Remover orçamento"
        description="A categoria continua existindo — ela só deixa de ser acompanhada."
        confirmLabel="Remover"
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
