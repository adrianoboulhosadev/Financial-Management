import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useCategoryPicker } from './hooks/use-category-picker'

interface CategoryPickerProps {
  label?: string
  value: string
  onChange: (categoryId: string) => void
  /** An income may have no category at all, so the empty option is allowed
   * there and refused on an expense. */
  allowEmpty?: boolean
}

/**
 * A phone does not have a `<select>`, so the same choice is a sheet. What is
 * OFFERED is identical to the web's picker: the whole tree, labelled by path.
 */
export function CategoryPicker({
  label = 'Categoria',
  value,
  onChange,
  allowEmpty = false,
}: CategoryPickerProps) {
  const picker = useCategoryPicker()
  const selected = value ? picker.labelOf(value) : ''

  return (
    <View>
      <Text className="mb-[7px] text-[9.5px] uppercase tracking-[1.5px] text-neutral-600">
        {label}
      </Text>

      <Pressable
        onPress={picker.toggle}
        className="rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3"
      >
        <Text className={`text-[13.5px] ${selected ? 'text-ink-text' : 'text-neutral-700'}`}>
          {selected || (allowEmpty ? 'Sem categoria' : 'Selecione…')}
        </Text>
      </Pressable>

      {!picker.loading && picker.options.length === 0 ? (
        <Text className="mt-1.5 text-[10.5px] text-neutral-600">
          Você ainda não tem categorias. Crie uma em Menu › Categorias.
        </Text>
      ) : null}

      <Modal visible={picker.open} transparent animationType="slide" onRequestClose={picker.close}>
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={picker.close}>
          <Pressable
            className="max-h-[70%] rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-3 text-[15px] font-medium text-ink-text">Escolher categoria</Text>

            <ScrollView>
              {allowEmpty ? (
                <Pressable
                  onPress={() => {
                    onChange('')
                    picker.close()
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className="text-[13px] text-neutral-600">Sem categoria</Text>
                </Pressable>
              ) : null}

              {picker.options.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onChange(option.id)
                    picker.close()
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className={option.id === value ? 'text-accent' : 'text-ink-text'}>
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
