import { Pressable, Text, View } from 'react-native'
import { formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { BudgetBar } from '@/components/budget-bar'
import { EmptyState } from '@/components/empty-state'
import { Kicker } from '@/components/kicker'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { MonthPie } from '@/components/month-pie'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { StatCard } from '@/components/stat-card'
import { ArrowInIcon, ArrowOutIcon } from '@/data/icons'
import { MonthTimeline } from './components/month-timeline'
import { DASHBOARD_TABS } from './data/tabs'
import { useDashboard } from './hooks/use-dashboard'

/**
 * The screen the product exists for: how much is left this month, and why.
 *
 * The leftover is the HEADLINE — the largest thing on the screen — because it
 * is the one figure the owner opens the app to read. Everything under it
 * explains that number, in the same order and the same shapes as the web's
 * dashboard.
 */
export function DashboardScreen() {
  const {
    period,
    setPeriod,
    report,
    loading,
    tab,
    setTab,
    bars,
    days,
    incomeCents,
    fixedCents,
    pendingFixedCents,
    leftoverShare,
    labelFor,
    captionFor,
  } = useDashboard()

  const header = (
    <ScreenHeader title="Dashboard">
      <MonthPicker period={period} onChange={setPeriod} />
    </ScreenHeader>
  )

  if (loading || !report) {
    return (
      <Screen header={header}>
        <Loading />
      </Screen>
    )
  }

  return (
    <Screen header={header}>
      <View className="gap-3 px-5 pt-2">
        <Pane className="p-[18px]">
          <Kicker>Sobra do mês</Kicker>
          <View className="mt-1.5 flex-row items-baseline gap-1.5">
            <Text className="text-[15px] text-neutral-600">R$</Text>
            <Amount
              cents={Math.abs(report.leftoverCents)}
              tone={report.leftoverCents < 0 ? 'expense' : 'income'}
              className="text-[38px] font-medium tracking-tighter"
            />
          </View>
          <Text className="mt-1.5 text-[11.5px] text-neutral-600">
            {incomeCents > 0 ? `${leftoverShare}% do que entrou` : 'sem renda cadastrada'}
            {pendingFixedCents > 0 ? ` · ${formatBRL(pendingFixedCents)} ainda a pagar` : ''}
          </Text>

          <View className="mt-[18px] border-t border-ink-border pt-[18px]">
            <MonthPie
              incomeCents={incomeCents}
              fixedCents={fixedCents}
              // What was spent OUTSIDE the fixed bills: the rows a recurrence
              // posted are already inside `fixedCents`, and counting them in
              // both would make the circle add up to more than the month.
              variableCents={Math.max(report.totalExpenseCents - fixedCents, 0)}
            />
          </View>
        </Pane>

        <View className="flex-row gap-3">
          <StatCard
            label="Entrou"
            accent="positive"
            icon={ArrowInIcon}
            value={<Amount cents={incomeCents} tone="income" className="text-lg font-medium" />}
            hint={
              report.realizedIncomeCents > 0
                ? `${formatBRL(report.plannedIncomeCents)} fixa + ${formatBRL(report.realizedIncomeCents)} avulso`
                : 'renda fixa cadastrada'
            }
          />
          <StatCard
            label="Saiu"
            accent="negative"
            icon={ArrowOutIcon}
            // The fixed bills of the month count here whether or not they have
            // been paid yet: money already promised is not money to spend.
            value={
              <Amount cents={report.totalExpenseCents} tone="expense" className="text-lg font-medium" />
            }
            hint={
              report.committedExpenseCents > 0
                ? `${formatBRL(report.committedExpenseCents)} ainda a pagar`
                : 'despesas lançadas no mês'
            }
          />
        </View>
      </View>

      <View className="mb-[18px] mt-5 flex-row gap-5 border-b border-ink-border px-5">
        {DASHBOARD_TABS.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setTab(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.value }}
            className={`-mb-px border-b-2 pb-2.5 ${
              tab === item.value ? 'border-accent' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-[12.5px] ${
                tab === item.value ? 'text-ink-text' : 'text-neutral-600'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="px-5">
        {tab === 'timeline' ? <MonthTimeline days={days} captionFor={captionFor} /> : null}

        {tab === 'categories' ? (
          bars.length === 0 ? (
            <EmptyState
              title="Nenhuma despesa neste mês"
              description="Assim que você lançar um gasto, ele aparece aqui separado por categoria."
            />
          ) : (
            <View className="gap-4">
              {bars.map((bar) => (
                <View key={bar.id} className="gap-[7px]">
                  <View className="flex-row items-baseline gap-2">
                    <Text numberOfLines={1} className="flex-1 text-[13px] text-ink-text">
                      {bar.label}
                    </Text>
                    <Amount cents={bar.cents} className="text-[11.5px] text-neutral-500" />
                  </View>
                  {/* Ranked against the month's whole spending, not against the
                      rows on screen: a top-six list must not rescale itself. */}
                  <View className="h-1.5 w-full overflow-hidden rounded-full bg-ink-border">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${
                          report.totalExpenseCents === 0
                            ? 0
                            : Math.round((bar.cents / report.totalExpenseCents) * 100)
                        }%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === 'budgets' ? (
          report.budgets.length === 0 ? (
            <EmptyState
              title="Nenhum teto definido"
              description="Defina quanto pode gastar por categoria em Menu › Orçamentos."
            />
          ) : (
            <View className="gap-4">
              {report.budgets.map((usage) => (
                <View key={usage.budgetId} className="gap-[7px]">
                  <View className="flex-row items-baseline gap-2">
                    <Text numberOfLines={1} className="flex-1 text-[13px] text-ink-text">
                      {labelFor(usage.categoryId)}
                    </Text>
                    <Text className="text-[11.5px] text-neutral-600">{usage.percentage}%</Text>
                  </View>
                  <BudgetBar percentage={usage.percentage} status={usage.status} />
                  <Text className="text-[10.5px] text-neutral-600">
                    {formatBRL(usage.spentCents)} de {formatBRL(usage.limitCents)}
                    {usage.remainingCents < 0
                      ? ` · ${formatBRL(-usage.remainingCents)} acima`
                      : ` · restam ${formatBRL(usage.remainingCents)}`}
                  </Text>
                </View>
              ))}
            </View>
          )
        ) : null}
      </View>
    </Screen>
  )
}
