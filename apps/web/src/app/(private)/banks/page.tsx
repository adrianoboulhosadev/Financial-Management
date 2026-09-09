'use client'

import { Button } from '@/components/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { CARD_KIND_LABELS } from 'ui'
import { BankForm } from './components/bank-form'
import { CardForm } from './components/card-form'
import { useBanksPage } from './hooks/use-banks-page'

/**
 * The owner's banks and the cards under them. One screen for both, because a
 * card is never reached without its bank: a bank row expands into its cards
 * rather than sending the owner off to a second list to line the two up by hand.
 */
export default function BanksPage() {
  const page = useBanksPage()

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <p className="text-sm text-ink-text-soft">
          Onde o seu dinheiro fica. Depois de cadastrar um banco, você pode registrar os cartões
          dele e dizer, em cada lançamento, por onde o dinheiro passou.
        </p>

        {page.loading ? (
          <Loading compact />
        ) : page.banks.length === 0 ? (
          <EmptyState
            title="Nenhum banco cadastrado"
            description="Cadastre ao lado o primeiro banco para começar a registrar por onde o dinheiro entra e sai."
          />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.banks.map((bank) => (
              <li key={bank.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => page.toggleExpanded(bank.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{bank.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-text-muted">
                      {[
                        bank.agency && `ag. ${bank.agency}`,
                        bank.accountNumber && `conta ${bank.accountNumber}`,
                        bank.cardCount === 1 ? '1 cartão' : `${bank.cardCount} cartões`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => page.openCardForm(bank.id)}
                    className="rounded px-2 py-1 text-xs text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-ink-text"
                  >
                    + cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => page.askToDeleteBank(bank)}
                    aria-label={`Excluir ${bank.name}`}
                    className="rounded px-2 py-1 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                  >
                    ✕
                  </button>
                </div>

                {page.expandedId === bank.id && (
                  <div className="mt-3 space-y-3 border-t border-ink-border pt-3">
                    {page.cardsOf(bank.id).length === 0 && page.addingCardTo !== bank.id ? (
                      <p className="text-xs text-ink-text-muted">
                        Nenhum cartão neste banco ainda.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {page.cardsOf(bank.id).map((card) => (
                          <li key={card.id} className="flex items-center gap-3 text-sm">
                            <span className="min-w-0 flex-1 truncate">
                              {card.name}{' '}
                              <span className="font-mono text-ink-text-muted">
                                ····{card.lastFourDigits}
                              </span>
                            </span>
                            <span className="text-xs text-ink-text-muted">
                              {CARD_KIND_LABELS[card.kind]}
                            </span>
                            <button
                              type="button"
                              onClick={() => page.askToDeleteCard(card)}
                              aria-label={`Excluir ${card.name}`}
                              className="rounded px-2 py-0.5 text-ink-text-muted transition-colors hover:bg-ink-surface-soft hover:text-negative"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {page.addingCardTo === bank.id ? (
                      <CardForm
                        bankId={bank.id}
                        onSubmit={page.createCard}
                        onCancel={page.closeCardForm}
                        submitting={page.creatingCard}
                      />
                    ) : (
                      <Button variant="secondary" onClick={() => page.openCardForm(bank.id)}>
                        Adicionar cartão
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <BankForm onSubmit={page.createBank} submitting={page.creatingBank} />
      </aside>

      <ConfirmDialog
        open={page.pendingDeletion !== null}
        title={
          page.pendingDeletion?.kind === 'card' ? 'Excluir cartão' : 'Excluir banco'
        }
        description={
          page.pendingDeletion?.kind === 'card'
            ? `"${page.pendingDeletion.card.name}" sai da lista. Lançamentos que já apontam para ele impedem a exclusão.`
            : page.pendingDeletion
              ? `"${page.pendingDeletion.bank.name}" sai da lista. Bancos com cartões, lançamentos ou investimentos não podem ser excluídos.`
              : undefined
        }
        onConfirm={page.confirmDeletion}
        onCancel={page.cancelDeletion}
      />
    </div>
  )
}
