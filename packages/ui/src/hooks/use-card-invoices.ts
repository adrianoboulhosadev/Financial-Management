'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CardInvoiceDTO, CardInvoicesDTO } from '@bank/adapters'
import { api } from '../http/api'
import { caption } from '../lib/captions'
import { formatShortDay } from '../format/date'

export const CARD_INVOICES_KEY = ['card-invoices']

/**
 * The invoices of the owner's credit cards.
 *
 * A hook of its own rather than another query inside `useBanks`: the card list
 * is read by every screen that files an expense, and none of those needs to
 * pull a month of charges along to render a picker.
 *
 * Cards with no closing day are simply absent from the answer — they have no
 * invoice, and a row reading "R$ 0,00" would claim they do.
 */
export function useCardInvoices() {
  const query = useQuery({
    queryKey: CARD_INVOICES_KEY,
    queryFn: async (): Promise<CardInvoicesDTO[]> =>
      (await api().get<CardInvoicesDTO[]>('/bank/card/invoice')).data,
  })

  const invoices = useMemo(() => query.data ?? [], [query.data])
  const byCard = useMemo(
    () => new Map(invoices.map((entry) => [entry.cardId, entry])),
    [invoices],
  )

  return {
    invoices,
    loading: query.isLoading,
    /** What one card owes and when — undefined for a card with no calendar. */
    invoicesOf: (cardId: string) => byCard.get(cardId),
    /** The invoice still taking charges: the one the screen leads with. */
    openInvoiceOf: (cardId: string) => byCard.get(cardId)?.invoices.find((entry) => entry.open),
    /** Everything already committed to invoices that have not opened yet — an
     * instalment plan, almost always. */
    upcomingOf: (cardId: string) =>
      byCard.get(cardId)?.invoices.filter((entry) => !entry.open) ?? [],
    /** "fecha 11 set · vence 18 set" — the two dates that make an invoice mean
     * something, spelled the same way in both fronts. */
    captionOf: (invoice: CardInvoiceDTO) =>
      caption(`fecha ${formatShortDay(invoice.closesOn)}`, `vence ${formatShortDay(invoice.dueOn)}`),
  }
}
