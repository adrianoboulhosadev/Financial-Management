import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { sanitizeMoneyInput } from 'ui'

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

export function Field({ label, error, money = false, className = '', onChangeText, ...props }: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#6d8096"
        keyboardType={money ? 'decimal-pad' : props.keyboardType}
        onChangeText={
          onChangeText && (money ? (text) => onChangeText(sanitizeMoneyInput(text)) : onChangeText)
        }
        className={`rounded-lg border border-ink-border bg-ink-bg px-3 py-3 text-ink-text ${
          money ? 'font-mono' : ''
        } ${className}`}
        {...props}
      />
      {error ? <Text className="text-sm text-negative">{error}</Text> : null}
    </View>
  )
}
