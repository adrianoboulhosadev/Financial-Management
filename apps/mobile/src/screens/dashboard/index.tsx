import { Text, View } from 'react-native'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Screen } from '@/components/screen'
import { StatCard } from '@/components/stat-card'
import { formatBRL } from 'ui'
import { useDashboard } from './hooks/use-dashboard'

/** The screen the product exists for: how much is left this month. Same three
 * headline numbers, same order and same colours as the web's. */
export function DashboardScreen() {
  const { period, setPeriod, report, loading, labelFor } = useDashboard()

  if (loading || !report) return <Loading />

  const incomeCents = report.plannedIncomeCents + report.realizedIncomeCents
  const biggest = report.byCategory.slice(0, 6)

  return (
    <Screen>
      <MonthPicker period={period} onChange={setPeriod} />

      <View className="gap-3">
        <StatCard
          label="Entrou"
          accent="positive"
          value={<Amount cents={incomeCents} tone="income" className="text-2xl" />}
          hint={
            report.realizedIncomeCents > 0
              ? `${formatBRL(report.plannedIncomeCents)} de renda fixa + ${formatBRL(report.realizedIncomeCents)} avulso`
              : 'renda fixa cadastrada'
          }
        />
        <StatCard
          label="Saiu"
          accent="negative"
          value={<Amount cents={report.expenseCents} tone="expense" className="text-2xl" />}
          hint="despesas lançadas no mês"
        />
        <StatCard
          label="Sobra"
          accent="accent"
          value={<Amount cents={report.leftoverCents} tone="movement" className="text-2xl" />}
          hint={report.leftoverCents < 0 ? 'o mês fechou no vermelho' : 'o que ainda está livre'}
        />
      </View>

      <View className="gap-3 rounded-card border border-ink-border bg-ink-surface p-4">
        <Text className="text-sm font-semibold text-ink-text">Orçamentos do mês</Text>

        {report.budgets.length === 0 ? (
          <Text className="text-sm text-ink-text-soft">
            Nenhum teto definido ainda. Defina um em Orçamentos.
          </Text>
        ) : (
          report.budgets.map((usage) => (
            <View key={usage.budgetId} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm text-ink-text-soft" numberOfLines={1}>
                  {labelFor(usage.categoryId)}
                </Text>
                <Text className="text-xs text-ink-text-muted">
                  {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)}
                </Text>
              </View>
              <BudgetBar percentage={usage.percentage} status={usage.status} />
            </View>
          ))
        )}
      </View>

      <View className="gap-3 rounded-card border border-ink-border bg-ink-surface p-4">
        <Text className="text-sm font-semibold text-ink-text">Para onde foi</Text>

        {biggest.length === 0 ? (
          <EmptyState
            title="Nenhuma despesa neste mês"
            description="Assim que você lançar um gasto, ele aparece aqui separado por categoria."
          />
        ) : (
          biggest.map((total) => (
            <View key={total.categoryId ?? 'none'} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm text-ink-text-soft" numberOfLines={1}>
                  {labelFor(total.categoryId)}
                </Text>
                <Amount cents={total.spentCents} className="text-sm" />
              </View>
              {/* Share of the month's spending, so the list reads as a ranking
                  and not just as numbers. */}
              <View className="h-1.5 w-full overflow-hidden rounded-full bg-ink-surface-soft">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${report.expenseCents === 0 ? 0 : Math.round((total.spentCents / report.expenseCents) * 100)}%`,
                  }}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  )
}
