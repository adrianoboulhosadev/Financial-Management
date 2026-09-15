'use client'

import { useState } from 'react'
import type {
  BankDTO,
  CardDTO,
  CreateBankInput,
  CreateCardInput,
  UpdateCardInput,
} from '@bank/adapters'

import { caption, useBanks, useCardInvoices } from 'ui'

/** What the screen is currently about to delete. A bank and a card ask
 * different questions when they go, so the dialog needs to know which one it is
 * looking at rather than just an id. */
type PendingDeletion =
  | { kind: 'bank'; bank: BankDTO }
  | { kind: 'card'; card: CardDTO }
  | null

/**
 * The screen's own state (which bank is expanded, which form is open, what is
 * about to be deleted) composed with the shared data hook — the same split
 * every other screen makes.
 */
export function useBanksPage() {
  const data = useBanks()
  const invoices = useCardInvoices()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null)
  // Which card the open form is EDITING — null while it is registering a new
  // one. The form itself is the same either way; only this says which.
  const [editingCard, setEditingCard] = useState<CardDTO | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null)
  const [composing, setComposing] = useState(false)

  return {
    banks: data.banks,
    loading: data.loading,
    cardsOf: data.cardsOf,
    expandedId,
    // Opening one bank closes the other: two lists of cards at once is a screen
    // nobody reads.
    toggleExpanded: (bankId: string) =>
      setExpandedId((current) => (current === bankId ? null : bankId)),
    addingCardTo,
    editingCard,
    openCardForm: (bankId: string) => {
      setExpandedId(bankId)
      setEditingCard(null)
      setAddingCardTo(bankId)
    },
    /** Editing an existing card. It is the only way a card registered before
     * invoices existed ever gets its calendar. */
    openCardEditor: (card: CardDTO) => {
      setExpandedId(card.bankId)
      setEditingCard(card)
      setAddingCardTo(card.bankId)
    },
    closeCardForm: () => {
      setAddingCardTo(null)
      setEditingCard(null)
    },
    composing,
    openComposer: () => setComposing(true),
    closeComposer: () => setComposing(false),
    createBank: (input: CreateBankInput) => {
      data.createBank(input)
      setComposing(false)
    },
    creatingBank: data.creatingBank,
    createCard: (input: CreateCardInput) => {
      data.createCard(input)
      setAddingCardTo(null)
    },
    updateCard: (input: UpdateCardInput & { id: string }) => {
      data.updateCard(input)
      setAddingCardTo(null)
      setEditingCard(null)
    },
    savingCard: data.creatingCard || data.updatingCard,
    pendingDeletion,
    askToDeleteBank: (bank: BankDTO) => setPendingDeletion({ kind: 'bank', bank }),
    askToDeleteCard: (card: CardDTO) => setPendingDeletion({ kind: 'card', card }),
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      if (pendingDeletion.kind === 'bank') data.removeBank(pendingDeletion.bank.id)
      else data.removeCard(pendingDeletion.card.id)
      setPendingDeletion(null)
    },
    /** "ag. 1234 · conta 5678 · 2 cartões" — how a bank reads in the list.
     * Agency and account are optional on purpose: what the product needs is a
     * name to file a payment under, and almost nobody wants to type an account
     * number into a budgeting app. */
    captionFor: (bank: BankDTO) =>
      caption(
        bank.agency && `ag. ${bank.agency}`,
        bank.accountNumber && `conta ${bank.accountNumber}`,
        bank.cardCount === 1 ? '1 cartão' : `${bank.cardCount} cartões`,
      ),
    // The invoice side of a card, straight from the shared hook — a card with
    // no calendar simply has none of these, and the screen renders nothing.
    invoicesOf: invoices.invoicesOf,
    openInvoiceOf: invoices.openInvoiceOf,
    upcomingOf: invoices.upcomingOf,
    invoiceCaptionOf: invoices.captionOf,
  }
}
