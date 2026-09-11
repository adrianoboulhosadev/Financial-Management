import { Pressable, Text, View } from 'react-native'
import { ACCENT, formatBRL, NEUTRAL, TRANSACTION_TYPES } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { CategoryPicker } from '@/components/category-picker'
import { Checkbox } from '@/components/checkbox'
import { Chip } from '@/components/chip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { PaymentFields } from '@/components/payment-fields'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { PlusIcon, RecurrencesIcon, TrashIcon } from '@/data/icons'
import { useRecurrencesScreen } from './hooks/use-recurrences-screen'

/**
 * What repeats every month — rent, a subscription, a course. On its day the
 * worker posts the movement on its own; this screen is where the rules are set,
 * and "A pagar" is where the month is ticked off.
 *
 * The list is grouped by WHERE IN THE MONTH the bill falls, because that is how
 * the money actually arrives and leaves.
 */
export function RecurrencesScreen() {
  const screen = useRecurrencesScreen()

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Fixos do mês"
            back
            bordered
            action={
              <Pressable
                onPress={screen.openForm}
                accessibilityLabel="Novo lançamento fixo"
                hitSlop={10}
              >
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
            subtitle={`${screen.recurrences.length} ${
              screen.recurrences.length === 1 ? 'compromisso' : 'compromissos'
            } · ${formatBRL(screen.monthlyCents)} por mês${
              screen.incomeShare !== null ? ` · ${screen.incomeShare}% do que entra` : ''
            }`}
          />
        }
      >
        <View className="px-5 pt-4">
          {screen.loading ? (
            <Loading compact />
          ) : screen.recurrences.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento fixo"
              description="Cadastre o que se repete todo mês e pare de lançar na mão."
              action={<Button label="Cadastrar fixo" onPress={screen.openForm} />}
            />
          ) : (
            screen.groups.map((group, groupIndex) => (
              <View key={group.key}>
                <Kicker className={`pb-1 ${groupIndex === 0 ? '' : 'pt-[18px]'}`}>
                  {group.title}
                </Kicker>

                {group.items.map((recurrence, index) => (
                  <ListRow key={recurrence.id} last={index === group.items.length - 1}>
                    <IconBadge
                      icon={RecurrencesIcon}
                      tone={recurrence.active ? 'accent' : 'muted'}
                    />

                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] ${
                          recurrence.active ? 'text-ink-text' : 'text-neutral-500 line-through'
                        }`}
                      >
                        {recurrence.description}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`mt-[3px] text-[11px] ${
                          recurrence.variableAmount ? 'text-warning' : 'text-neutral-600'
                        }`}
                      >
                        {screen.captionFor(recurrence)}
                      </Text>
                      {screen.deadlineLabelFor(recurrence) ? (
                        <Text className="mt-0.5 text-[11px] text-accent-300">
                          {screen.deadlineLabelFor(recurrence)}
                        </Text>
                      ) : null}
                    </View>

                    <Amount
                      cents={recurrence.amount}
                      tone={recurrence.active ? 'neutral' : 'muted'}
                      className="text-[13px]"
                    />

                    <Pressable onPress={() => screen.toggleActive(recurrence)} hitSlop={8}>
                      <Text className="text-[11px] text-accent-300">
                        {recurrence.active ? 'Pausar' : 'Retomar'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => screen.askToDelete(recurrence)}
                      accessibilityLabel={`Excluir ${recurrence.description}`}
                      hitSlop={8}
                    >
                      <TrashIcon color={NEUTRAL[700]} size={16} />
                    </Pressable>
                  </ListRow>
                ))}
              </View>
            ))
          )}
        </View>
      </Screen>

      <Sheet open={screen.formOpen} title="Novo lançamento fixo" onClose={screen.closeForm}>
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
          placeholder="Aluguel, streaming…"
          value={screen.description}
          onChangeText={screen.setDescription}
        />
        <Field
          label={screen.variableAmount ? 'Valor aproximado (R$)' : 'Valor (R$)'}
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

        {/* Declared at creation and never editable afterwards — flipping it on a
            bill whose months were already corrected would leave figures nobody
            could explain. */}
        <Checkbox
          label="O valor muda todo mês"
          hint="Conta de luz, água, cartão. Você informa um valor aproximado agora e ajusta em A pagar quando a conta chegar."
          checked={screen.variableAmount}
          onChange={screen.setVariableAmount}
        />

        {/* A course that lasts 8 months: after the deadline the bill leaves the
            month's list on its own, with nobody having to pause it. */}
        <Checkbox
          label="Tem prazo para acabar"
          hint="Curso, financiamento, parcelamento. Depois do último mês ele sai sozinho de A pagar."
          checked={screen.hasDeadline}
          onChange={screen.setHasDeadline}
        />

        {screen.hasDeadline ? (
          <Field
            label="Dura quantos meses"
            keyboardType="number-pad"
            value={screen.durationMonths}
            onChangeText={screen.setDurationMonths}
          />
        ) : null}

        <Checkbox
          label="Já é pago automaticamente"
          hint="Pix programado ou débito automático: entra como pago na data do vencimento, sem você precisar marcar."
          checked={screen.autoPaid}
          onChange={screen.setAutoPaid}
        />

        <PaymentFields
          bankId={screen.bankId}
          onBankChange={screen.setBankId}
          paymentMethod={screen.paymentMethod}
          onPaymentMethodChange={screen.setPaymentMethod}
          cardId={screen.cardId}
          onCardChange={screen.setCardId}
        />

        {/* Day 31 does not exist every month; the domain clamps it instead of
            skipping or rolling over, and saying so here avoids the surprise. */}
        {Number(screen.dayOfMonth) > 28 ? (
          <Text className="text-[10.5px] leading-relaxed text-neutral-600">
            Em meses mais curtos, o lançamento entra no último dia do mês.
          </Text>
        ) : null}

        <Button
          label={screen.creating ? 'Criando…' : 'Criar'}
          onPress={screen.submit}
          disabled={screen.creating || !screen.canSubmit}
        />
      </Sheet>

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
