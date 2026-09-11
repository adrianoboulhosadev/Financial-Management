import { Pressable, Text, View } from 'react-native'
import { formatBRL, formatDayHeading, NEUTRAL, TRANSACTION_FILTERS, TRANSACTION_TYPES } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Fab } from '@/components/fab'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { PaymentFields } from '@/components/payment-fields'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { ArrowInIcon, ArrowOutIcon, TrashIcon } from '@/data/icons'
import { useTransactionsScreen } from './hooks/use-transactions-screen'

/**
 * Everything that moved this month, newest day first — the same list the web
 * shows, with the form in a sheet the compose button raises.
 *
 * The rows are grouped by DAY with the day's own net in the heading, because
 * that is the unit the owner remembers spending in.
 */
export function TransactionsScreen() {
  const screen = useTransactionsScreen()

  const netCents = screen.transactions.reduce(
    (sum, transaction) =>
      sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0,
  )

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Lançamentos"
            subtitle={`${screen.transactions.length} ${
              screen.transactions.length === 1 ? 'registro' : 'registros'
            } · saldo ${formatBRL(netCents)}`}
          >
            <MonthPicker period={screen.period} onChange={screen.setPeriod} />

            <View className="mt-3.5 flex-row gap-1.5">
              {TRANSACTION_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  active={screen.filter === option.value}
                  onPress={() => screen.setFilter(option.value)}
                />
              ))}
            </View>
          </ScreenHeader>
        }
      >
        <View className="px-5">
          {screen.loading ? (
            <Loading compact />
          ) : screen.days.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento neste mês"
              description="Toque no + para registrar o primeiro gasto ou entrada do mês."
            />
          ) : (
            screen.days.map((day, index) => {
              const dayNetCents = day.items.reduce(
                (sum, item) => sum + (item.type === 'income' ? item.amount : -item.amount),
                0,
              )

              return (
                <View key={day.day}>
                  <Kicker
                    className={`pb-1.5 capitalize ${
                      index === 0 ? 'border-t border-ink-border pt-3.5' : 'pt-[18px]'
                    }`}
                  >
                    {`${formatDayHeading(day.date)} · ${formatBRL(dayNetCents)}`}
                  </Kicker>

                  {day.items.map((transaction) => (
                    <ListRow key={transaction.id}>
                      <IconBadge
                        icon={transaction.type === 'income' ? ArrowInIcon : ArrowOutIcon}
                        tone={transaction.type === 'income' ? 'income' : 'accent'}
                      />

                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-[13px] text-ink-text">
                          {transaction.description}
                        </Text>
                        <Text numberOfLines={1} className="mt-[3px] text-[11px] text-neutral-600">
                          {screen.captionFor(transaction)}
                        </Text>
                      </View>

                      <Amount
                        cents={transaction.amount}
                        tone={transaction.type === 'income' ? 'income' : 'expense'}
                        signed
                        className="text-[13.5px]"
                      />

                      <Pressable
                        onPress={() => screen.askToDelete(transaction)}
                        accessibilityLabel={`Excluir ${transaction.description}`}
                        hitSlop={8}
                      >
                        <TrashIcon color={NEUTRAL[700]} size={16} />
                      </Pressable>
                    </ListRow>
                  ))}
                </View>
              )
            })
          )}
        </View>
      </Screen>

      <Fab onPress={screen.openForm} accessibilityLabel="Novo lançamento" />

      <Sheet open={screen.formOpen} title="Novo lançamento" onClose={screen.closeForm}>
        <View className="flex-row gap-1.5">
          {TRANSACTION_TYPES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={screen.type === option.value}
              onPress={() => screen.setType(option.value)}
            />
          ))}
        </View>

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

        <PaymentFields
          bankId={screen.bankId}
          onBankChange={screen.setBankId}
          paymentMethod={screen.paymentMethod}
          onPaymentMethodChange={screen.setPaymentMethod}
          cardId={screen.cardId}
          onCardChange={screen.setCardId}
          installments={screen.installments}
          onInstallmentsChange={screen.setInstallments}
        />

        <Button
          label={screen.recording ? 'Registrando…' : 'Registrar'}
          onPress={screen.submit}
          disabled={screen.recording || !screen.canSubmit}
        />
      </Sheet>

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
