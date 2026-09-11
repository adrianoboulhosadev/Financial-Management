import { Link } from 'expo-router'
import { Image, Pressable, Text, View } from 'react-native'
import { mediaUrl, NEUTRAL, SEMANTIC } from 'ui'
import { Amount } from '@/components/amount'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { CaretRightIcon, LogoutIcon } from '@/data/icons'
import { useMore } from './hooks/use-more'

/**
 * Everything the five tabs could not hold, grouped by when it is used, with the
 * account at the top and the way out at the bottom.
 *
 * Each row carries its own number — four bills open, what the portfolio is
 * worth — so the menu answers "is there anything to do in there?" without being
 * opened.
 */
export function MoreScreen() {
  const { groups, user, displayName, initials, logout, badges } = useMore()

  return (
    <Screen header={<ScreenHeader title="Menu" />}>
      <View className="gap-4 px-5 pt-2">
        <Link href="/profile" asChild>
          <Pressable>
            <Pane className="flex-row items-center gap-3 px-4 py-3.5">
              <View className="h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-accent-900">
                {user?.avatarUrl ? (
                  <Image source={{ uri: mediaUrl(user.avatarUrl) }} className="h-full w-full" />
                ) : (
                  <Text className="text-[15px] font-medium text-accent-200">{initials}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[13.5px] text-ink-text">
                  {displayName}
                </Text>
                <Text numberOfLines={1} className="mt-0.5 text-[11px] text-neutral-600">
                  {user?.email}
                </Text>
              </View>
              <CaretRightIcon color={NEUTRAL[600]} size={15} />
            </Pane>
          </Pressable>
        </Link>

        {groups.map((group) => (
          <View key={group.title}>
            <Kicker className="pb-1.5">{group.title}</Kicker>
            <Pane className="px-4">
              {group.items.map((item, index) => {
                const badge = badges[item.href]

                return (
                  <Link key={item.href} href={item.href as never} asChild>
                    <Pressable>
                      <ListRow last={index === group.items.length - 1}>
                        <IconBadge icon={item.icon} />
                        <Text numberOfLines={1} className="flex-1 text-[13px] text-ink-text">
                          {item.label}
                        </Text>
                        {typeof badge === 'number' ? (
                          <Amount cents={badge} className="text-[11.5px] text-neutral-600" />
                        ) : badge ? (
                          <Text className="text-[11.5px] text-warning">{badge}</Text>
                        ) : null}
                        <CaretRightIcon color={NEUTRAL[700]} size={14} />
                      </ListRow>
                    </Pressable>
                  </Link>
                )
              })}
            </Pane>
          </View>
        ))}

        <Pane>
          <Pressable
            onPress={() => logout()}
            className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
          >
            <LogoutIcon color={SEMANTIC.negative} size={18} />
            <Text className="flex-1 text-[13px] text-negative">Sair da conta</Text>
          </Pressable>
        </Pane>
      </View>
    </Screen>
  )
}
