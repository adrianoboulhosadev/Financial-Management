import { Pressable, Text, View } from 'react-native'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  /** Colours the selected segment by what it MEANS (expense red, income green)
   * instead of by the neutral accent — the same treatment the web's type
   * toggle gets. */
  toneByValue?: Partial<Record<T, string>>
}

/** The phone's counterpart of the web's inline filter/type toggles. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  toneByValue,
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-lg border border-ink-border p-1">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 rounded px-3 py-2 ${
              selected ? (toneByValue?.[option.value] ?? 'bg-ink-surface-soft') : ''
            }`}
          >
            <Text
              className={`text-center text-sm ${selected ? 'text-ink-text' : 'text-ink-text-muted'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
