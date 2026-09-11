import { Pressable } from 'react-native'
import { INK } from 'ui'
import { PlusIcon } from '@/data/icons'

interface FabProps {
  onPress: () => void
  accessibilityLabel: string
}

/**
 * The compose button. It floats over the list rather than sitting in the header
 * because it is the thing the screen is FOR, and the bottom-right corner is
 * where a thumb already is.
 *
 * It is the one filled control in the product (see the button variants): with
 * nothing around it to be outlined against, an outline would leave it looking
 * like a hole in the list.
 */
export function Fab({ onPress, accessibilityLabel }: FabProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="absolute bottom-6 right-5 h-[52px] w-[52px] items-center justify-center rounded-full bg-accent active:opacity-80"
    >
      <PlusIcon color={INK.bg} size={24} />
    </Pressable>
  )
}
