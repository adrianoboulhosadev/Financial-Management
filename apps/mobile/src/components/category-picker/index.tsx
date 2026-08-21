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
 * OFFERED is identical to the web's picker: leaves only, labelled by path.
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
    <View className="gap-1.5">
      <Text className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
        {label}
      </Text>

      <Pressable
        onPress={picker.toggle}
        className="rounded-lg border border-ink-border bg-ink-bg px-3 py-3"
      >
        <Text className={selected ? 'text-ink-text' : 'text-ink-text-muted'}>
          {selected || (allowEmpty ? 'Sem categoria' : 'Selecione…')}
        </Text>
      </Pressable>

      {!picker.loading && picker.options.length === 0 ? (
        <Text className="text-sm text-ink-text-muted">
          Você ainda não tem uma categoria final. Crie uma em Mais › Categorias.
        </Text>
      ) : null}

      <Modal visible={picker.open} transparent animationType="slide" onRequestClose={picker.close}>
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={picker.close}>
          <Pressable
            className="max-h-[70%] rounded-t-card border-t border-ink-border bg-ink-surface p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-3 text-base font-semibold text-ink-text">Escolher categoria</Text>

            <ScrollView>
              {allowEmpty ? (
                <Pressable
                  onPress={() => {
                    onChange('')
                    picker.close()
                  }}
                  className="border-b border-ink-border py-3.5"
                >
                  <Text className="text-ink-text-muted">Sem categoria</Text>
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
