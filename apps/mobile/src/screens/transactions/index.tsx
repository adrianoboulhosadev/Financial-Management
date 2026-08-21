import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { formatDate, TRANSACTION_FILTERS, TRANSACTION_TYPES } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Screen } from '@/components/screen'
import { SegmentedControl } from '@/components/segmented-control'
import { useTransactionsScreen } from './hooks/use-transactions-screen'

/**
 * On a phone the web's side-by-side "list + form" becomes a list with the form
 * in a sheet — same fields, same rules, in the shape the viewport allows.
 */
export function TransactionsScreen() {
  const screen = useTransactionsScreen()

  return (
    <>
      <Screen>
        <MonthPicker period={screen.period} onChange={screen.setPeriod} />

        <SegmentedControl
          options={TRANSACTION_FILTERS}
          value={screen.filter}
          onChange={screen.setFilter}
        />

        <Button label="Novo lançamento" onPress={screen.openForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.transactions.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento neste mês"
            description="Toque em Novo lançamento para registrar o primeiro."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  index > 0 ? 'border-t border-ink-border' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-ink-text" numberOfLines={1}>
                    {transaction.description}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
                    {formatDate(transaction.occurredOn)} · {screen.labelFor(transaction.categoryId)}
                    {/* A row the worker posted, not the user — worth saying, so
                        nobody wonders where it came from. */}
                    {transaction.recurrenceId ? ' · fixo' : ''}
                  </Text>
                </View>

                <Amount
                  cents={transaction.amount}
                  tone={transaction.type === 'expense' ? 'expense' : 'income'}
                  signed
                  className="text-sm"
                />

                <Pressable
                  onPress={() => screen.askToDelete(transaction)}
                  accessibilityLabel={`Excluir ${transaction.description}`}
                  className="px-2 py-1"
                >
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
            <ScrollView
              contentContainerClassName="gap-4 p-4 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-base font-semibold text-ink-text">Novo lançamento</Text>

              <SegmentedControl
                options={TRANSACTION_TYPES}
                value={screen.type}
                onChange={screen.setType}
                toneByValue={{ expense: 'bg-negative/15', income: 'bg-positive/15' }}
              />

              <Field
                label="Descrição"
                placeholder="Mercado, cinema, conta de luz…"
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
                label="Data (AAAA-MM-DD)"
                placeholder="2026-08-10"
                value={screen.occurredOn}
                onChangeText={screen.setOccurredOn}
              />
              <CategoryPicker
                value={screen.categoryId}
                onChange={screen.setCategoryId}
                allowEmpty={!screen.categoryRequired}
              />

              <Button
                label={screen.recording ? 'Registrando…' : 'Registrar'}
                onPress={screen.submit}
                disabled={screen.recording || !screen.canSubmit}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title="Excluir lançamento"
        description={
          screen.pendingDeletion
            ? `"${screen.pendingDeletion.description}" sai do mês e os totais são recalculados. Não dá pra desfazer.`
            : undefined
        }
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
