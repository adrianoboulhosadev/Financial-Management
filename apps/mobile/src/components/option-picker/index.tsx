import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useState } from 'react'

export interface PickerOption {
  value: string
  label: string
}

interface OptionPickerProps {
  label: string
  value: string
  options: PickerOption[]
  onChange: (value: string) => void
  /** The row shown when nothing is chosen. A picker whose empty state is a
   * legitimate answer ("não informar") says so; one that must be answered says
   * "Selecione…". */
  placeholder?: string
  /** Offers the empty option inside the sheet, so a chosen value can be undone. */
  allowEmpty?: boolean
  disabled?: boolean
  hint?: string
}

/**
 * The phone's `<select>`: a row that opens a sheet. Same shape as the category
 * picker, and separate from it because that one knows about the category tree
 * while this one takes whatever list it is handed — banks, cards, payment
 * methods, investment kinds.
 */
export function OptionPicker({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione…',
  allowEmpty = false,
  disabled = false,
  hint,
}: OptionPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </Text>

      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`rounded-lg border border-ink-border bg-ink-bg px-3 py-3 ${disabled ? 'opacity-60' : ''}`}
      >
        <Text className={selected ? 'text-ink-text' : 'text-ink-text-muted'}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>

      {hint ? <Text className="text-xs text-ink-text-muted">{hint}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={() => setOpen(false)}>
          <Pressable
            className="max-h-[70%] rounded-t-card border-t border-ink-border bg-ink-surface p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-3 text-base font-semibold text-ink-text">{label}</Text>

            <ScrollView>
              {allowEmpty ? (
                <Pressable
                  onPress={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className="text-ink-text-muted">{placeholder}</Text>
                </Pressable>
              ) : null}

              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className={option.value === value ? 'text-accent' : 'text-ink-text'}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
