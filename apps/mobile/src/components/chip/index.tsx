import { Pressable, Text } from 'react-native'

interface ChipProps {
  label: string
  active?: boolean
  onPress: () => void
}

/** A filter pill. The selected one fills with the accent's darkest tint rather
 * than inverting, so a row of chips stays a row of chips. */
export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={`rounded-full border px-3 py-1.5 active:opacity-70 ${
        active ? 'border-accent-900 bg-accent-900' : 'border-ink-border-strong'
      }`}
    >
      <Text className={`text-[11px] ${active ? 'text-accent-200' : 'text-neutral-500'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
