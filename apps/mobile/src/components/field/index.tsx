import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { NEUTRAL, sanitizeMoneyInput } from 'ui'

interface FieldProps extends TextInputProps {
  label: string
  error?: string
  /**
   * A reais amount field: strips anything that is not a digit or a single
   * decimal separator as the user types, so no keyboard (or paste) can smuggle
   * in something the domain would reject. Pair with `toCents` on submit.
   */
  money?: boolean
}

export function Field({
  label,
  error,
  money = false,
  className = '',
  onChangeText,
  ...props
}: FieldProps) {
  return (
    <View>
      <Text className="mb-[7px] text-[9.5px] uppercase tracking-[1.5px] text-neutral-600">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={NEUTRAL[700]}
        keyboardType={money ? 'decimal-pad' : props.keyboardType}
        onChangeText={
          onChangeText && (money ? (text) => onChangeText(sanitizeMoneyInput(text)) : onChangeText)
        }
        style={money ? { fontVariant: ['tabular-nums'] } : undefined}
        className={`rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3 text-[13.5px] text-ink-text ${className}`}
        {...props}
      />
      {error ? <Text className="mt-1.5 text-xs text-negative">{error}</Text> : null}
    </View>
  )
}
