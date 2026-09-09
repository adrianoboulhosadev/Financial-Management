import { useMemo } from 'react'
import { useBanks } from 'ui'

/**
 * What the payment block needs off the bank context: the owner's banks, and the
 * cards of whichever bank is selected.
 *
 * Filtering the cards by bank AND by what the card can pay with is the point:
 * offering a debit-only card for a credit purchase would let the owner file
 * something that never happened.
 */
export function usePaymentFields(bankId: string, paymentMethod: string) {
  const { banks, cards, loading, cardsOf } = useBanks()

  const availableCards = useMemo(() => {
    if (!bankId) return []
    return cardsOf(bankId).filter((card) => {
      if (paymentMethod === 'credit') return card.kind === 'credit' || card.kind === 'both'
      if (paymentMethod === 'debit') return card.kind === 'debit' || card.kind === 'both'
      return true
    })
    // `cardsOf` is rebuilt on every render of the shared hook; the list it reads
    // is what actually changes, so that is what this tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, bankId, paymentMethod])

  return {
    banks,
    loading,
    availableCards,
    hasBanks: banks.length > 0,
    // Only a card payment needs a card; pix and cash never do.
    cardApplies: paymentMethod === 'credit' || paymentMethod === 'debit',
    // Splitting is a credit-card thing — the same rule the domain enforces,
    // made invisible here rather than discovered as an error message.
    installmentsApply: paymentMethod === 'credit',
  }
}
