import { Modal, Pressable, Text, View } from 'react-native'
import { Button } from '../button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Blocking confirmation for a destructive action — those must never fire on a
 * single tap, which on a phone is even easier to do by accident. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-ink-bg/80 px-6" onPress={onCancel}>
        <Pressable
          className="w-full max-w-sm gap-4 rounded-card border border-ink-border bg-ink-surface p-6"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="text-base font-semibold text-ink-text">{title}</Text>
          {description ? <Text className="text-sm text-ink-text-soft">{description}</Text> : null}

          <View className="flex-row justify-end gap-2">
            <Button label="Cancelar" variant="secondary" onPress={onCancel} />
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
