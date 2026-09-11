import { Pressable, Text, View } from 'react-native'
import { ACCENT, formatPeriod, NEUTRAL } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { OptionPicker } from '@/components/option-picker'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { CategoriesIcon, PencilIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { useCategoriesScreen } from './hooks/use-categories-screen'

/**
 * The owner's own filing cabinet. Nested as deep as they like — and ANY node
 * can receive money, branch or leaf: how deep to file something is the owner's
 * call, not a rule.
 *
 * The list is flat and ordered by what each category cost this month, because
 * that is the question being asked of it. The hierarchy still reads, in the
 * path on every row.
 */
export function CategoriesScreen() {
  const screen = useCategoriesScreen()

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Categorias"
            back
            bordered
            action={
              <Pressable onPress={screen.openForm} accessibilityLabel="Nova categoria" hitSlop={10}>
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
            subtitle={`${screen.categories.length} ${
              screen.categories.length === 1 ? 'categoria' : 'categorias'
            } · ${formatPeriod(screen.period)}`}
          />
        }
      >
        <View className="px-5 pt-1">
          {screen.loading ? (
            <Loading compact />
          ) : screen.rows.length === 0 ? (
            <EmptyState
              title="Nenhuma categoria ainda"
              description="Crie a primeira — por exemplo Casa, e depois Luz dentro dela."
              action={<Button label="Criar categoria" onPress={screen.openForm} />}
            />
          ) : (
            screen.rows.map((row, index) => (
              <ListRow key={row.category.id} last={index === screen.rows.length - 1}>
                <IconBadge icon={CategoriesIcon} tone={row.spentCents > 0 ? 'accent' : 'muted'} />

                <View className="flex-1">
                  <Text numberOfLines={1} className="text-[13px] text-ink-text">
                    {row.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className={`mt-[3px] text-[11px] ${
                      row.usage?.status === 'exceeded'
                        ? 'text-negative'
                        : row.usage?.status === 'warning'
                          ? 'text-warning'
                          : 'text-neutral-600'
                    }`}
                  >
                    {screen.captionFor(row)}
                  </Text>
                </View>

                {row.spentCents > 0 ? (
                  <Amount cents={row.spentCents} className="text-[13px]" />
                ) : (
                  <Text className="text-[13px] text-neutral-600">—</Text>
                )}

                <Pressable
                  onPress={() => screen.startRenaming(row.category)}
                  accessibilityLabel={`Renomear ${row.category.name}`}
                  hitSlop={8}
                >
                  <PencilIcon color={NEUTRAL[700]} size={16} />
                </Pressable>
                <Pressable
                  onPress={() => screen.askToDelete(row.category)}
                  accessibilityLabel={`Excluir ${row.category.name}`}
                  hitSlop={8}
                >
                  <TrashIcon color={NEUTRAL[700]} size={16} />
                </Pressable>
              </ListRow>
            ))
          )}
        </View>
      </Screen>

      <Sheet open={screen.formOpen} title="Nova categoria" onClose={screen.closeForm}>
        <Field
          label="Nome"
          placeholder="Casa, Lazer, Mercado…"
          value={screen.name}
          onChangeText={screen.setName}
        />

        <OptionPicker
          label="Dentro de"
          value={screen.parentId ?? ''}
          placeholder="Nenhuma (categoria principal)"
          allowEmpty
          options={screen.categories.map((category) => ({
            value: category.id,
            label: screen.pathOf(category.id),
          }))}
          onChange={(value) => screen.setParentId(value || null)}
        />

        <Button
          label={screen.creating ? 'Criando…' : 'Criar'}
          onPress={screen.submit}
          disabled={screen.creating || !screen.canSubmit}
        />
      </Sheet>

      <Sheet
        open={screen.renaming !== null}
        title="Renomear categoria"
        onClose={screen.cancelRenaming}
      >
        <Field label="Nome" value={screen.draftName} onChangeText={screen.setDraftName} />
        <Button
          label="Salvar"
          onPress={screen.confirmRenaming}
          disabled={!screen.draftName.trim()}
        />
      </Sheet>

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
