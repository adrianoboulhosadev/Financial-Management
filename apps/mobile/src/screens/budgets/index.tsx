import { Pressable, Text, View } from 'react-native'
import { ACCENT, BUDGET_STATUS_TEXT_CLASSES, formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { PlusIcon } from '@/data/icons'
import { useBudgetsScreen } from './hooks/use-budgets-screen'

/**
 * What the month was allowed to cost, and how much of that is gone.
 *
 * A ceiling NEVER blocks a purchase — spent money is a fact, and refusing to
 * record it would only make the numbers lie. Everything here is a reading.
 */
export function BudgetsScreen() {
  const screen = useBudgetsScreen()

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Orçamentos"
            back
            action={
              <Pressable
                onPress={() => screen.openForm()}
                accessibilityLabel="Definir orçamento"
                hitSlop={10}
              >
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
          >
            <MonthPicker period={screen.period} onChange={screen.setPeriod} />
          </ScreenHeader>
        }
      >
        <View className="gap-3 px-5 pt-1">
          {screen.loading ? (
            <Loading compact />
          ) : screen.usages.length === 0 ? (
            <EmptyState
              title="Nenhum orçamento definido"
              description="Escolha uma categoria e diga quanto você quer gastar por mês nela."
              action={<Button label="Definir o primeiro teto" onPress={() => screen.openForm()} />}
            />
          ) : (
            <>
              <Pane className="px-[18px] py-4">
                <Kicker>Gasto sob teto</Kicker>
                <View className="mt-1.5 flex-row items-baseline gap-2">
                  <Amount
                    cents={screen.spentCents}
                    className="text-[26px] font-medium tracking-tight"
                  />
                  <Text className="text-xs text-neutral-600">de {formatBRL(screen.limitCents)}</Text>
                </View>

                <View className="mt-3">
                  <BudgetBar
                    percentage={screen.cappedPercentage}
                    status={
                      screen.cappedPercentage >= 100
                        ? 'exceeded'
                        : screen.cappedPercentage >= 80
                          ? 'warning'
                          : 'ok'
                    }
                  />
                </View>

                <Text className="mt-2.5 text-[11.5px] text-neutral-600">
                  {screen.remainingCents >= 0
                    ? `Restam ${formatBRL(screen.remainingCents)}`
                    : `${formatBRL(-screen.remainingCents)} acima do teto`}
                  {screen.daysLeft !== null
                    ? ` para os últimos ${screen.daysLeft} dias do mês`
                    : ''}
                </Text>
              </Pane>

              <Pane className="gap-4 px-[18px] py-4">
                {screen.usages.map((usage) => (
                  <View key={usage.budgetId} className="gap-[7px]">
                    <View className="flex-row items-baseline gap-2">
                      <Text numberOfLines={1} className="flex-1 text-[13px] text-ink-text">
                        {screen.labelFor(usage.categoryId)}
                      </Text>
                      <Text className={`text-[11.5px] ${BUDGET_STATUS_TEXT_CLASSES[usage.status]}`}>
                        {usage.percentage}%
                      </Text>
                      <Pressable onPress={() => screen.askToDelete(usage)} hitSlop={8}>
                        <Text className="text-[11px] text-neutral-700">Remover</Text>
                      </Pressable>
                    </View>

                    <BudgetBar percentage={usage.percentage} status={usage.status} />

                    <Text
                      className={`text-[10.5px] ${
                        usage.remainingCents < 0 ? 'text-negative' : 'text-neutral-600'
                      }`}
                    >
                      {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)} ·{' '}
                      {usage.remainingCents >= 0
                        ? `restam ${formatBRL(usage.remainingCents)}`
                        : `${formatBRL(-usage.remainingCents)} acima`}
                    </Text>
                  </View>
                ))}
              </Pane>
            </>
          )}

          {screen.uncapped.length > 0 ? (
            <Pane className="px-[18px] py-4">
              <Kicker>Sem teto definido</Kicker>
              <View className="mt-3 gap-3">
                {screen.uncapped.map((total) => (
                  <View key={total.categoryId} className="flex-row items-center gap-3">
                    <Text numberOfLines={1} className="flex-1 text-[12.5px] text-neutral-400">
                      {screen.labelFor(total.categoryId)}
                    </Text>
                    <Amount cents={total.spentCents} className="text-[12.5px]" />
                    <Pressable onPress={() => screen.openForm(total.categoryId)} hitSlop={8}>
                      <Text className="text-[11px] text-accent-300">Definir</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </Pane>
          ) : null}
        </View>
      </Screen>

      <Sheet open={screen.formOpen} title="Definir orçamento" onClose={screen.closeForm}>
        <Text className="text-[11.5px] leading-relaxed text-neutral-600">
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
      </Sheet>

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
