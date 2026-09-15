import { Pressable, Text, View } from 'react-native'
import type { ChecklistItemDTO } from '@transaction/adapters'
import { formatBRL } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { useChecklistScreen } from './hooks/use-checklist-screen'

/**
 * The month's to-do list of fixed bills — the phone's copy of the web's, with
 * the same rules: every active recurrence is a line, nothing is created in
 * advance, and a bill on pix/direct debit ticks itself once its day passes.
 */
export function ChecklistScreen() {
  const screen = useChecklistScreen()

  const row = (item: ChecklistItemDTO, last: boolean) => (
    <View key={item.recurrenceId}>
      <ListRow last={last && screen.editingId !== item.recurrenceId}>
        <Checkbox
          checked={item.paid}
          // A bill the bank takes on its own is not the owner's to tick, and
          // letting them untick it would only make the list lie until the next
          // read.
          disabled={item.autoPaid}
          onChange={(checked) => screen.setPaid(item.recurrenceId, checked)}
          accessibilityLabel={`Marcar ${item.description} como pago`}
        />

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className={`text-[13px] ${item.paid ? 'text-neutral-400 line-through' : 'text-ink-text'}`}
          >
            {item.description}
          </Text>
          <Text
            numberOfLines={1}
            className={`mt-0.5 text-[11px] ${
              !item.paid && item.variableAmount ? 'text-warning' : 'text-neutral-600'
            }`}
          >
            {screen.captionFor(item)}
          </Text>
          {/* The estimate stays visible next to the corrected figure: the gap
              between the two is the surprise worth seeing. */}
          {item.variableAmount && item.amountCents !== item.estimatedCents ? (
            <Text className="mt-0.5 text-[10.5px] text-neutral-700">
              previsto {formatBRL(item.estimatedCents)}
            </Text>
          ) : null}
        </View>

        <Amount
          cents={item.amountCents}
          tone={item.paid ? 'muted' : 'neutral'}
          className={`text-[13px] ${item.paid ? '' : 'text-neutral-400'}`}
        />

        {/* Only a bill declared variable at creation may be corrected — the
            same rule the backend enforces, made untappable here. */}
        {item.variableAmount && screen.editingId !== item.recurrenceId ? (
          <Pressable onPress={() => screen.startEditing(item)} hitSlop={8}>
            <Text className="text-[11px] text-accent-300">Veio quanto?</Text>
          </Pressable>
        ) : null}
      </ListRow>

      {screen.editingId === item.recurrenceId ? (
        <View className={`gap-3 pb-4 ${last ? '' : 'border-b border-ink-border'}`}>
          <Field
            label="Valor da conta deste mês (R$)"
            money
            placeholder="0,00"
            value={screen.draftAmount}
            onChangeText={screen.setDraftAmount}
          />
          <Button
            label="Salvar"
            onPress={screen.confirmEditing}
            disabled={screen.adjusting || !screen.draftAmount}
          />
          {item.amountCents !== item.estimatedCents ? (
            <Button
              label="Voltar ao previsto"
              variant="secondary"
              onPress={() => screen.clearAdjustment(item)}
            />
          ) : null}
          <Button label="Cancelar" variant="ghost" onPress={screen.cancelEditing} />
        </View>
      ) : null}
    </View>
  )

  return (
    <Screen
      header={
        <ScreenHeader
          title="A pagar"
          back
          bordered
          subtitle={`${formatBRL(screen.pendingCents)} em aberto de ${formatBRL(
            screen.totalCents,
          )} · ${screen.settled.length} de ${screen.items.length} quitados`}
        >
          <MonthPicker period={screen.period} onChange={screen.setPeriod} />

          <View className="mt-3 h-[5px] w-full overflow-hidden rounded-full bg-ink-border">
            <View
              className="h-full bg-positive"
              style={{ width: `${screen.settledPercentage}%` }}
            />
          </View>
        </ScreenHeader>
      }
    >
      <View className="px-5 pt-4">
        {screen.loading ? (
          <Loading compact />
        ) : screen.empty ? (
          <EmptyState
            title="Nada a pagar neste mês"
            description="Cadastre o que se repete todo mês em Menu › Fixos do mês — e os cartões de crédito com dia de fechamento — e tudo aparece aqui."
          />
        ) : (
          <>
            {/* The invoices come FIRST: they are usually the biggest bill of
                the month and the one with the hardest deadline. They are a
                section of their own, and out of the totals above, because an
                invoice is a bill to settle and not a cost — every charge on it
                was already counted on the day it was made. */}
            {screen.invoices.length > 0 ? (
              <View>
                <Kicker className="pb-1">Faturas</Kicker>
                {screen.invoices.map((invoice, index) => (
                  <ListRow
                    key={`${invoice.cardId}-${invoice.period}`}
                    last={index === screen.invoices.length - 1}
                  >
                    <Checkbox
                      checked={invoice.paid}
                      onChange={(checked) =>
                        screen.setInvoicePaid(invoice.cardId, invoice.period, checked)
                      }
                      accessibilityLabel={`Marcar ${screen.invoiceLabelOf(invoice.cardId)} como paga`}
                    />

                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] ${
                          invoice.paid ? 'text-neutral-400 line-through' : 'text-ink-text'
                        }`}
                      >
                        {screen.invoiceLabelOf(invoice.cardId)}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`mt-0.5 text-[11px] ${
                          invoice.closed ? 'text-neutral-600' : 'text-warning'
                        }`}
                      >
                        {screen.invoiceCaptionOf(invoice)}
                      </Text>
                    </View>

                    <Amount
                      cents={invoice.amountCents}
                      tone={invoice.paid ? 'muted' : 'neutral'}
                      className="text-[13px]"
                    />
                  </ListRow>
                ))}

                <Text className="pt-2 text-[10.5px] leading-[16px] text-neutral-700">
                  As compras destas faturas já entraram no gasto do mês em que foram feitas, então
                  elas não somam no total dos fixos acima.
                </Text>
              </View>
            ) : null}

            {screen.open.length > 0 ? (
              <View>
                <Kicker className={`pb-1 ${screen.invoices.length > 0 ? 'pt-[18px]' : ''}`}>
                  Em aberto
                </Kicker>
                {screen.open.map((item, index) => row(item, index === screen.open.length - 1))}
              </View>
            ) : null}

            {screen.settled.length > 0 ? (
              <View>
                <Kicker className="pb-1 pt-[18px]">Pagos</Kicker>
                {screen.settled.map((item, index) => row(item, index === screen.settled.length - 1))}
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  )
}
