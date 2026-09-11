import type { ReactNode } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { NEUTRAL } from 'ui'
import { CloseIcon } from '@/data/icons'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A long form arrives from the BOTTOM — the same sheet the web opens, and the
 * shape the phone had already settled on.
 *
 * It stops short of the top so the screen it came from stays visible behind it,
 * which is what says "you are still on the lançamentos screen, filling
 * something in" instead of "you have navigated somewhere else".
 *
 * The two nested `Pressable`s are the dismiss: the backdrop closes, the sheet
 * itself swallows the press so a tap inside never falls through to it.
 */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-ink-bg/70" onPress={onClose}>
        <Pressable
          className="max-h-[88%] rounded-t-[20px] border-t border-ink-border-strong bg-ink-surface"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="flex-row items-center gap-3 border-b border-ink-border px-5 py-4">
            <Text className="flex-1 text-[15px] font-medium text-ink-text">{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel="Fechar" hitSlop={10}>
              <CloseIcon color={NEUTRAL[500]} size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-4 px-5 pb-8 pt-5" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
