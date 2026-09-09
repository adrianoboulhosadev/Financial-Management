import { useState } from 'react'
import type { BankDTO, CardDTO } from '@bank/adapters'

import { useBanks } from 'ui'

type PendingDeletion = { kind: 'bank'; bank: BankDTO } | { kind: 'card'; card: CardDTO } | null

/**
 * The screen's own state — which bank is expanded, which sheet is open, the two
 * forms, what is about to be deleted — composed with the shared data hook.
 *
 * The forms live here rather than in components of their own because on a phone
 * they are sheets the screen opens, not panels sitting beside a list.
 */
export function useBanksScreen() {
  const data = useBanks()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bankFormOpen, setBankFormOpen] = useState(false)
  const [cardFormBankId, setCardFormBankId] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null)

  const [name, setName] = useState('')
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const [cardName, setCardName] = useState('')
  const [cardKind, setCardKind] = useState('credit')
  const [lastFourDigits, setLastFourDigits] = useState('')

  const resetBankForm = () => {
    setName('')
    setAgency('')
    setAccountNumber('')
  }

  const resetCardForm = () => {
    setCardName('')
    setCardKind('credit')
    setLastFourDigits('')
  }

  return {
    banks: data.banks,
    loading: data.loading,
    cardsOf: data.cardsOf,
    expandedId,
    // Opening one bank closes the other: two lists of cards at once is a screen
    // nobody reads on a phone.
    toggleExpanded: (bankId: string) =>
      setExpandedId((current) => (current === bankId ? null : bankId)),

    bankFormOpen,
    openBankForm: () => setBankFormOpen(true),
    closeBankForm: () => {
      setBankFormOpen(false)
      resetBankForm()
    },
    name,
    setName,
    agency,
    setAgency,
    accountNumber,
    setAccountNumber,
    canSubmitBank: name.trim().length > 0,
    creatingBank: data.creatingBank,
    submitBank: () => {
      data.createBank({
        name,
        // Blank and absent mean the same thing to the domain, and only one of
        // them is worth sending.
        agency: agency.trim() || null,
        accountNumber: accountNumber.trim() || null,
      })
      setBankFormOpen(false)
      resetBankForm()
    },

    cardFormBankId,
    openCardForm: (bankId: string) => {
      setExpandedId(bankId)
      setCardFormBankId(bankId)
    },
    closeCardForm: () => {
      setCardFormBankId(null)
      resetCardForm()
    },
    cardName,
    setCardName,
    cardKind,
    setCardKind,
    lastFourDigits,
    // The full number never belongs in this product, so the field cannot accept
    // one even by accident.
    setLastFourDigits: (value: string) => setLastFourDigits(value.replace(/\D/g, '').slice(0, 4)),
    canSubmitCard: cardName.trim().length > 0 && lastFourDigits.length === 4,
    creatingCard: data.creatingCard,
    submitCard: () => {
      if (!cardFormBankId) return
      data.createCard({
        bankId: cardFormBankId,
        name: cardName,
        kind: cardKind,
        lastFourDigits,
      })
      setCardFormBankId(null)
      resetCardForm()
    },

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
