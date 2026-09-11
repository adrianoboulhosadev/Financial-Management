'use client'

import { CARD_BRAND_LABELS, CARD_KIND_LABELS } from 'ui'
import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { Sheet } from '@/components/sheet'
import { BanksIcon, CardIcon, PlusIcon, TrashIcon } from '@/data/icons'
import { BankForm } from './components/bank-form'
import { CardForm } from './components/card-form'
import { useBanksPage } from './hooks/use-banks-page'

/**
 * The owner's banks and the cards under them. One screen for both, because a
 * card is never reached without its bank: a bank row expands into its cards
 * rather than sending the owner off to a second list to line the two up by hand.
 *
 * A card carries no nickname — "Visa ····1234" is how it reads on a statement,
 * and asking somebody to invent a name for their own card is a field with no
 * answer.
 */
export default function BanksPage() {
  const page = useBanksPage()

  return (
    <>
      <ScreenHeader
        title="Bancos e cartões"
        backHref="/more"
        action={
          <button
            type="button"
            onClick={page.openComposer}
            aria-label="Novo banco"
            className="text-accent-300"
          >
            <PlusIcon size={19} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-5 pb-8 pt-1">
        {page.loading ? (
          <Loading compact />
        ) : page.banks.length === 0 ? (
          <EmptyState
            title="Nenhum banco cadastrado"
            description="Cadastre o primeiro banco para registrar por onde o dinheiro entra e sai."
            action={<Button onClick={page.openComposer}>Cadastrar banco</Button>}
          />
        ) : (
          page.banks.map((bank) => {
            const cards = page.cardsOf(bank.id)
            const expanded = page.expandedId === bank.id

            return (
              <Pane key={bank.id} className="px-[18px] py-4">
                <div className="flex items-center gap-3">
                  <IconBadge>
                    <BanksIcon size={17} />
                  </IconBadge>

                  <button
                    type="button"
                    onClick={() => page.toggleExpanded(bank.id)}
                    aria-expanded={expanded}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[13px]">{bank.name}</p>
                    <p className="mt-[3px] truncate text-[11px] text-neutral-600">
                      {page.captionFor(bank)}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => page.openCardForm(bank.id)}
                    className="flex-none text-[11px] text-accent-300 hover:underline"
                  >
                    + cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => page.askToDeleteBank(bank)}
                    aria-label={`Excluir ${bank.name}`}
                    className="flex-none text-neutral-700 transition-colors hover:text-negative"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>

                {expanded && (
                  <div className="mt-3.5 border-t border-ink-border pt-2">
                    {cards.length === 0 && page.addingCardTo !== bank.id ? (
                      <p className="py-2 text-[11px] text-neutral-600">
                        Nenhum cartão neste banco ainda.
                      </p>
                    ) : (
                      cards.map((card, index) => (
                        <ListRow key={card.id} last={index === cards.length - 1}>
                          <IconBadge tone="muted">
                            <CardIcon size={17} />
                          </IconBadge>
                          <span className="min-w-0 flex-1 truncate text-[13px]">
                            {CARD_BRAND_LABELS[card.brand]}{' '}
                            <span className="tabular-nums text-neutral-500">
                              ····{card.lastFourDigits}
                            </span>
                          </span>
                          <span className="flex-none text-[11px] text-neutral-600">
                            {CARD_KIND_LABELS[card.kind]}
                          </span>
                          <button
                            type="button"
                            onClick={() => page.askToDeleteCard(card)}
                            aria-label={`Excluir cartão final ${card.lastFourDigits}`}
                            className="flex-none text-neutral-700 transition-colors hover:text-negative"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </ListRow>
                      ))
                    )}

                    {page.addingCardTo === bank.id ? (
                      <div className="pt-3.5">
                        <Kicker className="pb-3">Novo cartão</Kicker>
                        <CardForm
                          bankId={bank.id}
                          onSubmit={page.createCard}
                          onCancel={page.closeCardForm}
                          submitting={page.creatingCard}
                        />
                      </div>
                    ) : (
                      <div className="pt-3.5">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => page.openCardForm(bank.id)}
                        >
                          Adicionar cartão
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Pane>
            )
          })
        )}
      </div>

      <Sheet open={page.composing} title="Novo banco" onClose={page.closeComposer}>
        <BankForm onSubmit={page.createBank} submitting={page.creatingBank} />
      </Sheet>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title={page.pendingDeletion?.kind === 'card' ? 'Excluir cartão' : 'Excluir banco'}
        description={
          page.pendingDeletion?.kind === 'card'
            ? `O cartão ····${page.pendingDeletion.card.lastFourDigits} sai da lista. Lançamentos que já apontam para ele impedem a exclusão.`
            : page.pendingDeletion
              ? `"${page.pendingDeletion.bank.name}" sai da lista. Bancos com cartões, lançamentos ou investimentos não podem ser excluídos.`
              : undefined
        }
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </>
  )
}
