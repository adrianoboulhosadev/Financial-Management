import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { NEUTRAL } from 'ui'
import { CaretLeftIcon } from '@/data/icons'

interface ScreenHeaderProps {
  title: string
  /** The screen's one affordance, at the far right of the title line. */
  action?: ReactNode
  /** The quiet line under the title: what the screen adds up to. */
  subtitle?: string
  /** Only the screens reached THROUGH the menu get a caret — a tab is never
   * something you came from. */
  back?: boolean
  /** The month pill, a row of filter chips, a progress bar. */
  children?: ReactNode
  /** Closes the header with a rule, for a screen whose body is a bare list. */
  bordered?: boolean
}

/**
 * The top of every screen, drawn by the SCREEN rather than by the navigator.
 *
 * Expo Router's native header can hold a title and a button and nothing else,
 * and these screens need a month pill, a filter row and a progress bar up
 * there. Turning it off (see the private layout) and drawing the header in the
 * body is also what makes this pixel-identical to the web's `<ScreenHeader>`,
 * which a platform header could never be.
 */
export function ScreenHeader({
  title,
  action,
  subtitle,
  back = false,
  children,
  bordered = false,
}: ScreenHeaderProps) {
  return (
    <View className={`px-5 pb-3 pt-2 ${bordered ? 'border-b border-ink-border' : ''}`}>
      <View className="flex-row items-center gap-3">
        {back && (
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            hitSlop={8}
          >
            <CaretLeftIcon color={NEUTRAL[500]} size={19} />
          </Pressable>
        )}
        <Text className="flex-1 text-[19px] font-medium tracking-tight text-ink-text">{title}</Text>
        {action}
      </View>

      {subtitle ? <Text className="mt-1.5 text-[11.5px] text-neutral-600">{subtitle}</Text> : null}
      {children}
    </View>
  )
}
