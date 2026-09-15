import { Linking, Modal, Pressable, Text, View } from 'react-native'
import { mediaUrl, NEUTRAL } from 'ui'
import { Button } from '@/components/button'
import { Kicker } from '@/components/kicker'
import { PlusIcon, TrashIcon } from '@/data/icons'
import { useReceiptField } from './hooks/use-receipt-field'

interface ReceiptFieldProps {
  /** The stored URL, or null when nothing is attached yet. */
  url: string | null
  onUploaded: (url: string) => void
  onRemove: () => void
}

/**
 * The receipt of a movement — the phone's half of the web's `<ReceiptField>`.
 *
 * The file is a DOCUMENT: the backend never crops or re-encodes it (altering it
 * would be altering the proof). The 0.8 quality here is the CAPTURE setting of
 * the camera, which is a different thing — what is shot is what is uploaded,
 * untouched from then on.
 */
export function ReceiptField({ url, onUploaded, onRemove }: ReceiptFieldProps) {
  const field = useReceiptField(onUploaded)

  return (
    <View>
      <Kicker className="mb-[7px]">Comprovante</Kicker>

      {url ? (
        <View className="flex-row items-center gap-3 rounded-field border border-ink-border-strong bg-ink-surface px-3.5 py-3">
          <Pressable className="flex-1" onPress={() => Linking.openURL(mediaUrl(url))}>
            <Text numberOfLines={1} className="text-[13px] text-accent-300">
              Ver comprovante
            </Text>
          </Pressable>
          <Pressable onPress={onRemove} accessibilityLabel="Remover comprovante" hitSlop={8}>
            <TrashIcon color={NEUTRAL[600]} size={16} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={field.openChooser}
          disabled={field.uploading}
          className="flex-row items-center gap-2.5 rounded-field border border-dashed border-ink-border-strong px-3.5 py-3 active:opacity-70"
        >
          <PlusIcon color={NEUTRAL[field.uploading ? 600 : 400]} size={16} />
          <Text className={`text-[13px] ${field.uploading ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {field.uploading ? 'Enviando…' : 'Anexar nota ou comprovante'}
          </Text>
        </Pressable>
      )}

      {/* Camera or gallery — the two ways a receipt reaches a phone. */}
      <Modal
        visible={field.choosing}
        transparent
        animationType="slide"
        onRequestClose={field.closeChooser}
      >
        <Pressable className="flex-1 justify-end bg-ink-bg/70" onPress={field.closeChooser}>
          <Pressable
            className="gap-3 rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-1 text-[15px] font-medium text-ink-text">Anexar comprovante</Text>
            <Button label="Tirar foto" onPress={() => field.pick('camera')} />
            <Button
              label="Escolher da galeria"
              variant="secondary"
              onPress={() => field.pick('library')}
            />
            <Button label="Cancelar" variant="ghost" onPress={field.closeChooser} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
