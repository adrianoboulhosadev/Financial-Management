import { useState } from 'react'
import type { BankDTO, CardDTO } from '@bank/adapters'

import { BANK_SUGGESTIONS, caption, kindAllowsCredit, toCents, useBanks, useCardInvoices } from 'ui'

/** The option that reveals the free-text field — the same escape hatch the
 * web's form has, so the two ask the question the same way. */
export const OTHER_BANK = '__other__'

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
  const invoices = useCardInvoices()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bankFormOpen, setBankFormOpen] = useState(false)
  const [cardFormBankId, setCardFormBankId] = useState<string | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion>(null)

  const [selected, setSelected] = useState('')
  const [customName, setCustomName] = useState('')
  const [agency, setAgency] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const [cardBrand, setCardBrand] = useState('visa')
  const [cardKind, setCardKind] = useState('credit')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [cardLimit, setCardLimit] = useState('')
  // The card the sheet is EDITING, or null while it registers a new one. It is
  // the only way a card registered before invoices existed gets its calendar.
  const [editingCard, setEditingCard] = useState<CardDTO | null>(null)

  const resetBankForm = () => {
    setSelected('')
    setCustomName('')
    setAgency('')
    setAccountNumber('')
  }

  // Derived from the two controls, so there is a single answer to "what is
  // being submitted" instead of two fields that can disagree.
  const choosingOther = selected === OTHER_BANK
  const name = choosingOther ? customName : selected

  const resetCardForm = () => {
    setCardBrand('visa')
    setCardKind('credit')
    setLastFourDigits('')
    setClosingDay('')
    setDueDay('')
    setCardLimit('')
    setEditingCard(null)
  }

  const onCredit = kindAllowsCredit(cardKind)
  // Both days or neither: half a calendar is no calendar, and the domain
  // refuses it — so the button goes quiet instead of the request coming back
  // with a 400.
  const calendarComplete = (closingDay === '') === (dueDay === '')

  /** A card that no longer settles on credit has its calendar and limit CLEARED
   * in the same request: the entity refuses to keep them, and sending them
   * anyway would turn a valid edit into an error. */
  const creditFields = () => ({
    closingDay: onCredit && closingDay ? Number(closingDay) : null,
    dueDay: onCredit && dueDay ? Number(dueDay) : null,
    limitCents: onCredit && cardLimit ? toCents(cardLimit) : null,
  })

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
    bankOptions: [
      ...BANK_SUGGESTIONS.map((bank) => ({ value: bank, label: bank })),
      { value: OTHER_BANK, label: 'Outro (digitar o nome)' },
    ],
    selected,
    setSelected,
    choosingOther,
    customName,
    setCustomName,
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
    editingCard,
    openCardForm: (bankId: string) => {
      setExpandedId(bankId)
      resetCardForm()
      setCardFormBankId(bankId)
    },
    openCardEditor: (card: CardDTO) => {
      setExpandedId(card.bankId)
      setEditingCard(card)
      setCardBrand(card.brand)
      setCardKind(card.kind)
      setLastFourDigits(card.lastFourDigits)
      setClosingDay(card.closingDay === null ? '' : String(card.closingDay))
      setDueDay(card.dueDay === null ? '' : String(card.dueDay))
      setCardLimit(card.limitCents === null ? '' : String(card.limitCents / 100).replace('.', ','))
      setCardFormBankId(card.bankId)
    },
    closeCardForm: () => {
      setCardFormBankId(null)
      resetCardForm()
    },
    cardBrand,
    setCardBrand,
    cardKind,
    setCardKind,
    lastFourDigits,
    // The full number never belongs in this product, so the field cannot accept
    // one even by accident.
    setLastFourDigits: (value: string) => setLastFourDigits(value.replace(/\D/g, '').slice(0, 4)),
    onCredit,
    closingDay,
    setClosingDay: (value: string) => setClosingDay(dayOfMonth(value)),
    dueDay,
    setDueDay: (value: string) => setDueDay(dayOfMonth(value)),
    cardLimit,
    setCardLimit,
    canSubmitCard: lastFourDigits.length === 4 && calendarComplete,
    savingCard: data.creatingCard || data.updatingCard,
    submitCard: () => {
      if (!cardFormBankId) return
      const fields = { brand: cardBrand, kind: cardKind, lastFourDigits, ...creditFields() }

      if (editingCard) data.updateCard({ id: editingCard.id, ...fields })
      else data.createCard({ bankId: cardFormBankId, ...fields })

      setCardFormBankId(null)
      resetCardForm()
    },

    /** "ag. 1234 · conta 5678 · 2 cartões" — how a bank reads in the list.
     * Agency and account are optional on purpose: what the product needs is a
     * name to file a payment under. */
    captionFor: (bank: BankDTO) =>
      caption(
        bank.agency && `ag. ${bank.agency}`,
        bank.accountNumber && `conta ${bank.accountNumber}`,
        bank.cardCount === 1 ? '1 cartão' : `${bank.cardCount} cartões`,
      ),
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
    // The invoice side of a card, straight from the shared hook — a card with
    // no calendar simply has none of these, and the screen renders nothing.
    invoicesOf: invoices.invoicesOf,
    openInvoiceOf: invoices.openInvoiceOf,
    upcomingOf: invoices.upcomingOf,
    invoiceCaptionOf: invoices.captionOf,
  }
}

/** 1-31, as the owner types it — the same window the domain accepts. */
function dayOfMonth(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 2)
  if (digits === '' || Number(digits) <= 31) return digits
  return '31'
}
