import { Tabs } from 'expo-router'
import { COLORS } from 'ui'
import { BudgetsIcon, DashboardIcon, IncomeIcon, MoreIcon, TransactionsIcon } from '@/data/icons'
import { NotificationBell } from '@/components/notification-bell'

/**
 * Four primary destinations plus "Mais" — five slots, which is what a thumb can
 * hit reliably. The web's bottom tab bar mirrors this exact split below `sm`,
 * so the browser on a phone and the installed app navigate the same way.
 *
 * Colours come from the shared tokens rather than hex literals, for the same
 * reason every other surface does.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.ink.surface },
        headerTintColor: COLORS.ink.text,
        headerTitleStyle: { fontFamily: 'Inter-SemiBold' },
        headerRight: () => <NotificationBell />,
        sceneStyle: { backgroundColor: COLORS.ink.bg },
        tabBarStyle: {
          backgroundColor: COLORS.ink.surface,
          borderTopColor: COLORS.ink.border,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.ink['text-muted'],
        tabBarLabelStyle: { fontFamily: 'Inter', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Visão do mês',
          tabBarLabel: 'Mês',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Lançamentos',
          tabBarLabel: 'Lançar',
          tabBarIcon: ({ color }) => <TransactionsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Orçamentos',
          tabBarLabel: 'Teto',
          tabBarIcon: ({ color }) => <BudgetsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Renda',
          tabBarIcon: ({ color }) => <IncomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => <MoreIcon color={color} />,
        }}
      />
    </Tabs>
  )
}
