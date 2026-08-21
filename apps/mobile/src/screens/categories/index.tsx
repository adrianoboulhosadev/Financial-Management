import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { useCategoriesScreen } from './hooks/use-categories-screen'

export function CategoriesScreen() {
  const screen = useCategoriesScreen()

  return (
    <>
      <Screen>
        <Button label="Nova categoria" onPress={screen.openForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.rows.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie a primeira — por exemplo Casa, e depois Luz dentro dela."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.rows.map(({ category, depth }, index) => (
              <View
                key={category.id}
                className={`flex-row items-center gap-3 py-3 pr-4 ${
                  index > 0 ? 'border-t border-ink-border' : ''
                }`}
                style={{ paddingLeft: 16 + depth * 20 }}
              >
                <Text className="flex-1 text-sm text-ink-text" numberOfLines={1}>
                  {category.name}
                  {/* Only a leaf can receive money, so saying which nodes merely
                      group others saves a failed attempt later. */}
                  {category.isLeaf ? '' : '  agrupa'}
                </Text>

                <Pressable onPress={() => screen.askToDelete(category)} className="px-2 py-1">
                  <Text className="text-ink-text-muted">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Screen>

      <Modal
        visible={screen.formOpen}
        transparent
        animationType="slide"
        onRequestClose={screen.closeForm}
      >
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={screen.closeForm}>
          <Pressable
            className="max-h-[80%] rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView contentContainerClassName="gap-4 p-4 pb-8" keyboardShouldPersistTaps="handled">
              <Text className="text-base font-semibold text-ink-text">Nova categoria</Text>

              <Field
                label="Nome"
                placeholder="Casa, Lazer, Mercado…"
                value={screen.name}
                onChangeText={screen.setName}
              />

              <View className="gap-1.5">
                <Text className="text-xs font-medium uppercase tracking-wide text-ink-text-muted">
                  Dentro de
                </Text>
                <Pressable
                  onPress={() => screen.setParentId(null)}
                  className={`rounded-lg border px-3 py-3 ${
                    screen.parentId === null ? 'border-accent' : 'border-ink-border'
                  }`}
                >
                  <Text className="text-ink-text">Nenhuma (categoria principal)</Text>
                </Pressable>

                {screen.categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => screen.setParentId(category.id)}
                    className={`rounded-lg border px-3 py-3 ${
                      screen.parentId === category.id ? 'border-accent' : 'border-ink-border'
                    }`}
                  >
                    <Text className="text-ink-text">{screen.pathOf(category.id)}</Text>
                  </Pressable>
                ))}
              </View>

              <Button
                label={screen.creating ? 'Criando…' : 'Criar'}
                onPress={screen.submit}
                disabled={screen.creating || !screen.canSubmit}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title="Excluir categoria"
        description={
          screen.pendingDeletion
            ? `"${screen.pendingDeletion.name}" será removida. Só é possível excluir uma categoria sem subcategorias e sem nada lançado nela.`
            : undefined
        }
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
