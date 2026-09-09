'use client'

import { useState } from 'react'
import type { BankDTO, CardDTO, CreateBankInput, CreateCardInput } from '@bank/adapters'

import { useBanks } from 'ui'

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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null)

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
    openCardForm: (bankId: string) => {
      setExpandedId(bankId)
      setAddingCardTo(bankId)
    },
    closeCardForm: () => setAddingCardTo(null),
    createBank: (input: CreateBankInput) => data.createBank(input),
    creatingBank: data.creatingBank,
    createCard: (input: CreateCardInput) => {
      data.createCard(input)
      setAddingCardTo(null)
    },
    creatingCard: data.creatingCard,
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
  }
}
