import { Pressable, Text, View } from 'react-native'
import { INK } from 'ui'
import { CheckIcon } from '@/data/icons'

interface CheckboxProps {
  /** Omit it for a bare tick — the checklist's rows, where the row's own text
   * IS the label. Pass `accessibilityLabel` there instead. */
  label?: string
  /** The line under the label. Every box in this product is a rule the owner is
   * choosing, and a rule needs a sentence. */
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  accessibilityLabel?: string
}

/**
 * React Native has no checkbox element, so this is a tappable box drawn from
 * the same tokens — and now the same Phosphor tick — the web's uses. The whole
 * row is the hit target: a 19px square is not something a thumb can be asked to
 * find.
 */
export function Checkbox({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked, disabled }}
      hitSlop={label ? undefined : 8}
      className={`flex-row items-start gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <View
        className={`mt-px h-[19px] w-[19px] items-center justify-center rounded-[5px] border-[1.5px] ${
          checked ? 'border-accent bg-accent' : 'border-neutral-700'
        }`}
      >
        {checked ? <CheckIcon color={INK.bg} size={12} /> : null}
      </View>
      {label ? (
        <View className="flex-1">
          <Text className="text-[13px] text-ink-text">{label}</Text>
          {hint ? <Text className="mt-0.5 text-[11px] text-neutral-600">{hint}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  )
}
