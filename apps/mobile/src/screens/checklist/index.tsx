import { Pressable, Text, View } from 'react-native'
import { formatBRL, formatDate } from 'ui'
import { Amount } from '@/components/amount'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { MonthPicker } from '@/components/month-picker'
import { Screen } from '@/components/screen'
import { StatCard } from '@/components/stat-card'
import { useChecklistScreen } from './hooks/use-checklist-screen'

/**
 * The month's to-do list of fixed bills — the phone's copy of the web's, with
 * the same rules: every active recurrence is a line, nothing is created in
 * advance, and a bill on pix/direct debit ticks itself once its day passes.
 *
 * The tick is a tappable box rather than a checkbox element (React Native has
 * none), and the whole row area around it is the hit target.
 */
export function ChecklistScreen() {
  const screen = useChecklistScreen()

  return (
    <Screen>
      <MonthPicker period={screen.period} onChange={screen.setPeriod} />

      <View className="gap-3">
        <StatCard
          label="Total do mês"
          value={<Amount cents={screen.totalCents} tone="expense" className="text-2xl" />}
          hint="tudo que se repete todo mês"
        />
        <StatCard
          label="Já pago"
          accent="positive"
          value={<Amount cents={screen.paidCents} tone="income" className="text-2xl" />}
          hint="marcado ou em débito automático"
        />
        <StatCard
          label="Falta pagar"
          accent="negative"
          value={<Amount cents={screen.pendingCents} tone="expense" className="text-2xl" />}
          hint={screen.pendingCents === 0 ? 'mês fechado' : 'ainda em aberto'}
        />
      </View>

      {screen.loading ? (
        <Loading compact />
      ) : screen.items.length === 0 ? (
        <EmptyState
          title="Nenhum fixo neste mês"
          description="Cadastre o que se repete todo mês em Mais › Fixos do mês e ele aparece aqui."
        />
      ) : (
        <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
          {screen.items.map((item, index) => (
            <View
              key={item.recurrenceId}
              className={`px-4 py-3 ${index > 0 ? 'border-t border-ink-border' : ''}`}
            >
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => !item.autoPaid && screen.setPaid(item.recurrenceId, !item.paid)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.paid, disabled: item.autoPaid }}
                  accessibilityLabel={`Marcar ${item.description} como pago`}
                  // A bill the bank takes on its own is not the owner's to tick.
                  className={`h-6 w-6 items-center justify-center rounded border ${
                    item.paid ? 'border-positive bg-positive' : 'border-ink-border-strong bg-ink-bg'
                  } ${item.autoPaid ? 'opacity-60' : ''}`}
                >
                  {item.paid ? <Text className="text-xs font-bold text-ink-bg">✓</Text> : null}
                </Pressable>

                <View className="flex-1">
                  <Text
                    className={`text-sm font-medium ${item.paid ? 'text-ink-text-muted line-through' : 'text-ink-text'}`}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                  <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
                    vence em {formatDate(item.dueOn)} · {screen.labelFor(item.categoryId)}
                    {item.autoPaid ? ' · automático' : ''}
                    {item.posted ? ' · já lançado' : ''}
                  </Text>
                  {/* The estimate stays visible next to the corrected figure:
                      the gap between the two is the surprise worth seeing. */}
                  {item.variableAmount && item.amountCents !== item.estimatedCents ? (
                    <Text className="mt-0.5 text-xs text-ink-text-muted">
                      previsto {formatBRL(item.estimatedCents)}
                    </Text>
                  ) : null}
                </View>

                <Amount
                  cents={item.amountCents}
                  tone={item.type === 'expense' ? 'expense' : 'income'}
                  className="text-sm"
                />

                {/* Only a bill declared variable at creation may be corrected —
                    the same rule the backend enforces, made untappable here. */}
                {item.variableAmount && screen.editingId !== item.recurrenceId ? (
                  <Pressable onPress={() => screen.startEditing(item)} className="px-2 py-1">
                    <Text className="text-xs text-ink-text-muted">Veio quanto?</Text>
                  </Pressable>
                ) : null}
              </View>

              {screen.editingId === item.recurrenceId ? (
                <View className="mt-3 gap-3 border-t border-ink-border pt-3">
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
                      variant="ghost"
                      onPress={() => screen.clearAdjustment(item)}
                    />
                  ) : null}
                  <Button label="Cancelar" variant="ghost" onPress={screen.cancelEditing} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Screen>
  )
}
