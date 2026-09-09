import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { BANK_SUGGESTIONS, CARD_KIND_LABELS, CARD_KIND_OPTIONS } from 'ui'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { OptionPicker } from '@/components/option-picker'
import { Screen } from '@/components/screen'
import { useBanksScreen } from './hooks/use-banks-screen'

/**
 * The owner's banks and the cards under them. Same single screen as the web's,
 * because a card is never reached without its bank — only the two forms move
 * into sheets, which is what the viewport allows.
 *
 * The bank name is a picker of suggestions PLUS a free-text field: a phone has
 * no `<datalist>`, so the two halves of the web's one control become two
 * controls that write into the same value.
 */
export function BanksScreen() {
  const screen = useBanksScreen()

  return (
    <>
      <Screen>
        <Text className="text-sm text-ink-text-soft">
          Onde o seu dinheiro fica. Depois de cadastrar um banco, você pode registrar os cartões
          dele e dizer, em cada lançamento, por onde o dinheiro passou.
        </Text>

        <Button label="Novo banco" onPress={screen.openBankForm} />

        {screen.loading ? (
          <Loading compact />
        ) : screen.banks.length === 0 ? (
          <EmptyState
            title="Nenhum banco cadastrado"
            description="Toque em Novo banco para começar a registrar por onde o dinheiro entra e sai."
          />
        ) : (
          <View className="overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {screen.banks.map((bank, index) => (
              <View
                key={bank.id}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-ink-border' : ''}`}
              >
                <View className="flex-row items-center gap-3">
                  <Pressable onPress={() => screen.toggleExpanded(bank.id)} className="flex-1">
                    <Text className="text-sm font-medium text-ink-text" numberOfLines={1}>
                      {bank.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-ink-text-muted" numberOfLines={1}>
                      {[
                        bank.agency && `ag. ${bank.agency}`,
                        bank.accountNumber && `conta ${bank.accountNumber}`,
                        bank.cardCount === 1 ? '1 cartão' : `${bank.cardCount} cartões`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => screen.askToDeleteBank(bank)}
                    accessibilityLabel={`Excluir ${bank.name}`}
                    className="px-2 py-1"
                  >
                    <Text className="text-ink-text-muted">✕</Text>
                  </Pressable>
                </View>

                {screen.expandedId === bank.id ? (
                  <View className="mt-3 gap-3 border-t border-ink-border pt-3">
                    {screen.cardsOf(bank.id).length === 0 ? (
                      <Text className="text-xs text-ink-text-muted">
                        Nenhum cartão neste banco ainda.
                      </Text>
                    ) : (
                      screen.cardsOf(bank.id).map((card) => (
                        <View key={card.id} className="flex-row items-center gap-3">
                          <Text className="flex-1 text-sm text-ink-text" numberOfLines={1}>
                            {card.name}{' '}
                            <Text className="font-mono text-ink-text-muted">
                              ····{card.lastFourDigits}
                            </Text>
                          </Text>
                          <Text className="text-xs text-ink-text-muted">
                            {CARD_KIND_LABELS[card.kind]}
                          </Text>
                          <Pressable
                            onPress={() => screen.askToDeleteCard(card)}
                            accessibilityLabel={`Excluir ${card.name}`}
                            className="px-2 py-1"
                          >
                            <Text className="text-ink-text-muted">✕</Text>
                          </Pressable>
                        </View>
                      ))
                    )}

                    <Button
                      label="Adicionar cartão"
                      variant="secondary"
                      onPress={() => screen.openCardForm(bank.id)}
                    />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Screen>

      <Modal
        visible={screen.bankFormOpen}
        transparent
        animationType="slide"
        onRequestClose={screen.closeBankForm}
      >
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={screen.closeBankForm}>
          <Pressable
            className="max-h-[88%] rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView
              contentContainerClassName="gap-4 p-4 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-base font-semibold text-ink-text">Novo banco</Text>

              {/* Suggestions and free text write into the SAME value: picking
                  one fills the field, and a bank nobody listed is still
                  typeable. */}
              <OptionPicker
                label="Escolher da lista"
                value={BANK_SUGGESTIONS.includes(screen.name) ? screen.name : ''}
                placeholder="Ou digite abaixo"
                allowEmpty
                options={BANK_SUGGESTIONS.map((bank) => ({ value: bank, label: bank }))}
                onChange={screen.setName}
              />

              <Field
                label="Banco"
                placeholder="Itaú, Nubank…"
                value={screen.name}
                onChangeText={screen.setName}
              />
              <Field
                label="Agência (opcional)"
                placeholder="0001"
                value={screen.agency}
                onChangeText={screen.setAgency}
              />
              <Field
                label="Conta (opcional)"
                placeholder="12345-6"
                value={screen.accountNumber}
                onChangeText={screen.setAccountNumber}
              />

              <Button
                label={screen.creatingBank ? 'Cadastrando…' : 'Cadastrar banco'}
                onPress={screen.submitBank}
                disabled={screen.creatingBank || !screen.canSubmitBank}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={screen.cardFormBankId !== null}
        transparent
        animationType="slide"
        onRequestClose={screen.closeCardForm}
      >
        <Pressable className="flex-1 justify-end bg-ink-bg/80" onPress={screen.closeCardForm}>
          <Pressable
            className="max-h-[88%] rounded-t-card border-t border-ink-border bg-ink-surface"
            onPress={(event) => event.stopPropagation()}
          >
            <ScrollView
              contentContainerClassName="gap-4 p-4 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-base font-semibold text-ink-text">Novo cartão</Text>

              <Field
                label="Nome do cartão"
                placeholder="Black, Conta corrente…"
                value={screen.cardName}
                onChangeText={screen.setCardName}
              />
              <OptionPicker
                label="Tipo"
                value={screen.cardKind}
                options={CARD_KIND_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={screen.setCardKind}
              />
              <Field
                label="4 últimos dígitos"
                keyboardType="number-pad"
                placeholder="1234"
                value={screen.lastFourDigits}
                onChangeText={screen.setLastFourDigits}
              />

              <Button
                label={screen.creatingCard ? 'Salvando…' : 'Salvar cartão'}
                onPress={screen.submitCard}
                disabled={screen.creatingCard || !screen.canSubmitCard}
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title={screen.pendingDeletion?.kind === 'card' ? 'Excluir cartão' : 'Excluir banco'}
        description={
          screen.pendingDeletion?.kind === 'card'
            ? `"${screen.pendingDeletion.card.name}" sai da lista. Lançamentos que já apontam para ele impedem a exclusão.`
            : screen.pendingDeletion
              ? `"${screen.pendingDeletion.bank.name}" sai da lista. Bancos com cartões, lançamentos ou investimentos não podem ser excluídos.`
              : undefined
        }
        onConfirm={screen.confirmDeletion}
        onCancel={screen.cancelDeletion}
      />
    </>
  )
}
