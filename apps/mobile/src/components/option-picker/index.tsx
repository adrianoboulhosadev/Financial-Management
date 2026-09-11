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
    <View>
      <Text className="mb-[7px] text-[9.5px] uppercase tracking-[1.5px] text-neutral-600">
        {label}
      </Text>

      <Pressable
        onPress={() => !disabled && setOpen(true)}
        className={`rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3 ${disabled ? 'opacity-60' : ''}`}
      >
        <Text className={`text-[13.5px] ${selected ? 'text-ink-text' : 'text-neutral-700'}`}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>

      {hint ? <Text className="mt-1.5 text-[10.5px] text-neutral-600">{hint}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={() => setOpen(false)}>
          <Pressable
            className="max-h-[70%] rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-3 text-[15px] font-medium text-ink-text">{label}</Text>

            <ScrollView>
              {allowEmpty ? (
                <Pressable
                  onPress={() => {
                    onChange('')
                    setOpen(false)
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className="text-[13px] text-neutral-600">{placeholder}</Text>
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
                  <Text className={`text-[13px] ${option.value === value ? 'text-accent' : 'text-ink-text'}`}>
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
