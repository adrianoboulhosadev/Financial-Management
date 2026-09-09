import { Pressable, Text, View } from 'react-native'

interface CheckboxProps {
  label: string
  /** The line under the label. Every box in this product is a rule the owner is
   * choosing, and a rule needs a sentence. */
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * React Native has no checkbox element, so this is a tappable box drawn from
 * the same tokens the web's uses. The whole row is the hit target — a 16px
 * square is not something a thumb can be asked to find.
 */
export function Checkbox({ label, hint, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      className={`flex-row items-start gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
          checked ? 'border-accent bg-accent' : 'border-ink-border-strong bg-ink-bg'
        }`}
      >
        {checked ? <Text className="text-xs font-bold text-ink-bg">✓</Text> : null}
      </View>
      <View className="flex-1">
        <Text className="text-sm text-ink-text">{label}</Text>
        {hint ? <Text className="mt-0.5 text-xs text-ink-text-muted">{hint}</Text> : null}
      </View>
    </Pressable>
  )
}
