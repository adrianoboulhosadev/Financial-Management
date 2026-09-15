import { Pressable, Text, View } from 'react-native'
import {
  ACCENT,
  CARD_BRAND_LABELS,
  CARD_BRAND_OPTIONS,
  CARD_KIND_LABELS,
  CARD_KIND_OPTIONS,
  NEUTRAL,
} from 'ui'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { IconBadge } from '@/components/icon-badge'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { OptionPicker } from '@/components/option-picker'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { BanksIcon, CardIcon, PencilIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { CardInvoice } from './components/card-invoice'
import { useBanksScreen } from './hooks/use-banks-screen'

/**
 * The owner's banks and the cards under them. Same single screen as the web's,
 * because a card is never reached without its bank — only the two forms move
 * into sheets, which is what the viewport allows.
 *
 * A card carries no nickname — "Visa ····1234" is how it reads on a statement,
 * and asking somebody to invent a name for their own card is a field with no
 * answer.
 */
export function BanksScreen() {
  const screen = useBanksScreen()

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Bancos e cartões"
            back
            action={
              <Pressable onPress={screen.openBankForm} accessibilityLabel="Novo banco" hitSlop={10}>
                <PlusIcon color={ACCENT[300]} size={19} />
              </Pressable>
            }
          />
        }
      >
        <View className="gap-3 px-5 pt-1">
          {screen.loading ? (
            <Loading compact />
          ) : screen.banks.length === 0 ? (
            <EmptyState
              title="Nenhum banco cadastrado"
              description="Cadastre o primeiro banco para registrar por onde o dinheiro entra e sai."
              action={<Button label="Cadastrar banco" onPress={screen.openBankForm} />}
            />
          ) : (
            screen.banks.map((bank) => {
              const cards = screen.cardsOf(bank.id)
              const expanded = screen.expandedId === bank.id

              return (
                <Pane key={bank.id} className="px-[18px] py-4">
                  <View className="flex-row items-center gap-3">
                    <IconBadge icon={BanksIcon} />

                    <Pressable
                      onPress={() => screen.toggleExpanded(bank.id)}
                      accessibilityState={{ expanded }}
                      className="flex-1"
                    >
                      <Text numberOfLines={1} className="text-[13px] text-ink-text">
                        {bank.name}
                      </Text>
                      <Text numberOfLines={1} className="mt-[3px] text-[11px] text-neutral-600">
                        {screen.captionFor(bank)}
                      </Text>
                    </Pressable>

                    <Pressable onPress={() => screen.openCardForm(bank.id)} hitSlop={8}>
                      <Text className="text-[11px] text-accent-300">+ cartão</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => screen.askToDeleteBank(bank)}
                      accessibilityLabel={`Excluir ${bank.name}`}
                      hitSlop={8}
                    >
                      <TrashIcon color={NEUTRAL[700]} size={16} />
                    </Pressable>
                  </View>

                  {expanded ? (
                    <View className="mt-3.5 border-t border-ink-border pt-2">
                      {cards.length === 0 ? (
                        <Text className="py-2 text-[11px] text-neutral-600">
                          Nenhum cartão neste banco ainda.
                        </Text>
                      ) : (
                        cards.map((card, index) => {
                          const invoices = screen.invoicesOf(card.id)

                          return (
                            <ListRow key={card.id} last={index === cards.length - 1}>
                              <View className="flex-1">
                                <View className="flex-row items-center gap-3">
                                  <IconBadge icon={CardIcon} tone="muted" />
                                  <Text
                                    numberOfLines={1}
                                    className="flex-1 text-[13px] text-ink-text"
                                  >
                                    {CARD_BRAND_LABELS[card.brand]}{' '}
                                    <Text className="text-neutral-500">
                                      ····{card.lastFourDigits}
                                    </Text>
                                  </Text>
                                  <Text className="text-[11px] text-neutral-600">
                                    {CARD_KIND_LABELS[card.kind]}
                                  </Text>
                                  <Pressable
                                    onPress={() => screen.openCardEditor(card)}
                                    accessibilityLabel={`Editar cartão final ${card.lastFourDigits}`}
                                    hitSlop={8}
                                  >
                                    <PencilIcon color={NEUTRAL[700]} size={16} />
                                  </Pressable>
                                  <Pressable
                                    onPress={() => screen.askToDeleteCard(card)}
                                    accessibilityLabel={`Excluir cartão final ${card.lastFourDigits}`}
                                    hitSlop={8}
                                  >
                                    <TrashIcon color={NEUTRAL[700]} size={16} />
                                  </Pressable>
                                </View>

                                {/* Only a card that knows when it closes has an
                                    invoice to show. The rest are just cards. */}
                                {invoices ? (
                                  <CardInvoice
                                    invoices={invoices}
                                    open={screen.openInvoiceOf(card.id)}
                                    upcoming={screen.upcomingOf(card.id)}
                                    captionOf={screen.invoiceCaptionOf}
                                  />
                                ) : null}
                              </View>
                            </ListRow>
                          )
                        })
                      )}

                      <View className="pt-3.5">
                        <Button
                          label="Adicionar cartão"
                          variant="secondary"
                          onPress={() => screen.openCardForm(bank.id)}
                        />
                      </View>
                    </View>
                  ) : null}
                </Pane>
              )
            })
          )}
        </View>
      </Screen>

      <Sheet open={screen.bankFormOpen} title="Novo banco" onClose={screen.closeBankForm}>
        {/* One control, with "Outro" as the escape hatch — the list is a
            shortcut, not a limit. */}
        <OptionPicker
          label="Banco"
          value={screen.selected}
          options={screen.bankOptions}
          onChange={screen.setSelected}
        />

        {screen.choosingOther ? (
          <Field
            label="Nome do banco"
            placeholder="Como ele aparece pra você"
            value={screen.customName}
            onChangeText={screen.setCustomName}
          />
        ) : null}
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
      </Sheet>

      <Sheet
        open={screen.cardFormBankId !== null}
        title={screen.editingCard ? 'Editar cartão' : 'Novo cartão'}
        onClose={screen.closeCardForm}
      >
        <OptionPicker
          label="Bandeira"
          value={screen.cardBrand}
          options={CARD_BRAND_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={screen.setCardBrand}
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

        {/* Only a card that settles on CREDIT closes an invoice or holds a
            limit — the same rule the entity applies, so the fields are not
            offered just to be refused. */}
        {screen.onCredit ? (
          <>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label="Fecha dia"
                  keyboardType="number-pad"
                  placeholder="11"
                  value={screen.closingDay}
                  onChangeText={screen.setClosingDay}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Vence dia"
                  keyboardType="number-pad"
                  placeholder="18"
                  value={screen.dueDay}
                  onChangeText={screen.setDueDay}
                />
              </View>
            </View>
            <Field
              label="Limite (opcional)"
              money
              placeholder="0,00"
              value={screen.cardLimit}
              onChangeText={screen.setCardLimit}
            />
            <Text className="text-[11px] leading-[17px] text-neutral-600">
              Com os dois dias preenchidos, a fatura do cartão aparece aqui na lista. O limite é
              opcional — sem ele a fatura continua sendo mostrada, só não vira barra.
            </Text>
          </>
        ) : null}

        <Button
          label={screen.savingCard ? 'Salvando…' : screen.editingCard ? 'Salvar alterações' : 'Salvar cartão'}
          onPress={screen.submitCard}
          disabled={screen.savingCard || !screen.canSubmitCard}
        />
      </Sheet>

      <ConfirmDialog
        open={screen.pendingDeletion !== null}
        title={screen.pendingDeletion?.kind === 'card' ? 'Excluir cartão' : 'Excluir banco'}
        description={
          screen.pendingDeletion?.kind === 'card'
            ? `O cartão ····${screen.pendingDeletion.card.lastFourDigits} sai da lista. Lançamentos que já apontam para ele impedem a exclusão.`
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
