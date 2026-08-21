import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { formatDate, TRANSACTION_TYPES } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { SegmentedControl } from '@/components/segmented-control'
import { useRecurrencesScreen } from './hooks/use-recurrences-screen'

export function RecurrencesScreen() {
  const screen = useRecurrencesScreen()

  return (
    <>
      <Screen>
        <Text className="text-sm text-ink-text-soft">
          O que se repete todo mês — aluguel, assinatura, mensalidade. Na data marcada o lançamento
          entra sozinho e você recebe um aviso.
        </Text>

        <Button label="Novo lançamento fixo" onPress={screen.openForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.recurrences.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento fixo"
            description="Cadastre o que se repete todo mês e pare de lançar na mão."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.recurrences.map((recurrence, index) => (
              <View
                key={recurrence.id}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  index > 0 ? 'border-t border-ink-border' : ''
                }`}
              >
                <View className="flex-1">
                  <Text
                    className={`text-sm font-medium ${recurrence.active ? 'text-ink-text' : 'text-ink-text-muted line-through'}`}
                    numberOfLines={1}
                  >
                    {recurrence.description}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
                    todo dia {recurrence.dayOfMonth} · {screen.labelFor(recurrence.categoryId)}
                    {recurrence.active
                      ? ` · próximo em ${formatDate(recurrence.nextRunAt)}`
                      : ' · pausado'}
                  </Text>
                </View>

                <Amount
                  cents={recurrence.amount}
                  tone={recurrence.type === 'expense' ? 'expense' : 'income'}
                  signed
                  className="text-sm"
                />

                <Pressable onPress={() => screen.toggleActive(recurrence)} className="px-2 py-1">
                  <Text className="text-xs text-ink-text-muted">
                    {recurrence.active ? 'Pausar' : 'Retomar'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => screen.askToDelete(recurrence)} className="px-2 py-1">
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
            className="max-h-[88%] rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView contentContainerClassName="gap-4 p-4 pb-8" keyboardShouldPersistTaps="handled">
              <Text className="text-base font-semibold text-ink-text">Novo lançamento fixo</Text>

              <SegmentedControl
                options={TRANSACTION_TYPES}
                value={screen.type}
                onChange={screen.setType}
                toneByValue={{ expense: 'bg-negative/15', income: 'bg-positive/15' }}
              />

              <Field
                label="Descrição"
                placeholder="Aluguel, streaming…"
                value={screen.description}
                onChangeText={screen.setDescription}
              />
              <Field
                label="Valor (R$)"
                money
                placeholder="0,00"
                value={screen.amount}
                onChangeText={screen.setAmount}
              />
              <Field
                label="Dia do mês"
                keyboardType="number-pad"
                value={screen.dayOfMonth}
                onChangeText={screen.setDayOfMonth}
              />
              <CategoryPicker
                value={screen.categoryId}
                onChange={screen.setCategoryId}
                allowEmpty={!screen.categoryRequired}
              />

              {/* Day 31 does not exist every month; the domain clamps it instead
                  of skipping or rolling over, and saying so avoids the surprise. */}
              {Number(screen.dayOfMonth) > 28 ? (
                <Text className="text-xs text-ink-text-muted">
                  Em meses mais curtos, o lançamento entra no último dia do mês.
                </Text>
              ) : null}

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
        title="Excluir lançamento fixo"
        description="Os lançamentos que ele já criou continuam no histórico — só para de gerar novos."
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
