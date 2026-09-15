import { Pressable, Text } from 'react-native'

interface ChipProps {
  label: string
  active?: boolean
  disabled?: boolean
  onPress: () => void
}

/** A filter pill. The selected one fills with the accent's darkest tint rather
 * than inverting, so a row of chips stays a row of chips. */
export function Chip({ label, active = false, disabled = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      // A disabled chip still has to READ as the current choice when it is the
      // active one — the transaction form uses it to state a direction that can
      // no longer change, not to grey out an option.
      className={`rounded-full border px-3 py-1.5 ${disabled ? '' : 'active:opacity-70'} ${
        active
          ? 'border-accent-900 bg-accent-900'
          : `border-ink-border-strong ${disabled ? 'opacity-40' : ''}`
      }`}
    >
      <Text className={`text-[11px] ${active ? 'text-accent-200' : 'text-neutral-500'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
