import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { ACCENT, COLORS, NEUTRAL, useNotifications } from 'ui'
import {
  DashboardFilledIcon,
  DashboardIcon,
  IncomeFilledIcon,
  IncomeIcon,
  MoreFilledIcon,
  MoreIcon,
  NotificationsFilledIcon,
  NotificationsIcon,
  TransactionsFilledIcon,
  TransactionsIcon,
} from '@/data/icons'

/**
 * The five tabs, in the order a thumb reaches them — the SAME five, in the same
 * order, as the web's bottom bar. These are the screens opened every day; what
 * is set up once rather than read daily lives behind "Menu".
 *
 * A tab says it is the current one by FILLING IN, which is the one statement
 * the outline weight cannot make on its own.
 *
 * Headers are off: every screen draws its own (see `<ScreenHeader>`), because
 * the top of a screen is where they differ most — a month pill here, a row of
 * chips there — and the native header can hold a title and a button.
 */
export default function TabsLayout() {
  // The dot is the only unread signal in the chrome now that there is no header
  // to hang a bell on.
  const { unreadCount } = useNotifications()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.ink.bg },
        tabBarStyle: {
          backgroundColor: COLORS.ink.surface,
          borderTopColor: COLORS.ink.border,
        },
        tabBarActiveTintColor: ACCENT.DEFAULT,
        tabBarInactiveTintColor: NEUTRAL[600],
        tabBarLabelStyle: { fontFamily: 'Inter', fontSize: 9.5 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <DashboardFilledIcon color={color} size={21} />
            ) : (
              <DashboardIcon color={color} size={21} />
            ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Lançar',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <TransactionsFilledIcon color={color} size={21} />
            ) : (
              <TransactionsIcon color={color} size={21} />
            ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color, focused }) => (
            <View>
              {focused ? (
                <NotificationsFilledIcon color={color} size={21} />
              ) : (
                <NotificationsIcon color={color} size={21} />
              )}
              {unreadCount > 0 ? (
                <View className="absolute -right-0.5 -top-px h-1.5 w-1.5 rounded-full bg-accent" />
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Renda',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <IncomeFilledIcon color={color} size={21} />
            ) : (
              <IncomeIcon color={color} size={21} />
            ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) =>
            focused ? <MoreFilledIcon color={color} size={21} /> : <MoreIcon color={color} size={21} />,
        }}
      />
    </Tabs>
  )
}
