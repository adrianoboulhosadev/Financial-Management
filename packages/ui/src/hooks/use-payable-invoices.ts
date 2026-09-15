'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PayableInvoiceDTO } from '@bank/adapters'
import { api } from '../http/api'
import { errorMessage } from '../http/errors'
import { caption } from '../lib/captions'
import { formatShortDay } from '../format/date'
import { clientConfig } from '../config'
import { useBanks } from './use-banks'

export const PAYABLE_INVOICES_KEY = ['payable-invoices']

/**
 * The credit-card invoices the month has to SETTLE, for the "A pagar" screen.
 *
 * It is a hook of its own and NOT part of `useChecklist` on purpose, and the
 * reason is the same one that keeps the two apart on screen: an invoice is a
 * bill to pay, never a cost. Every charge on it was already recorded as a
 * movement on the day it was made, so folding it into the checklist's
 * `totalCents` would count the same money twice — the totals would stop
 * matching the month the dashboard reports.
 *
 * Ticking one off invalidates nothing but this list, for the same reason:
 * paying an invoice moves no money the product has not already counted.
 */
export function usePayableInvoices(period: string) {
  const queryClient = useQueryClient()
  const { notifier } = clientConfig()
  // Composed here and not in each screen so a card is NAMED identically in both
  // fronts — the same reason the caption lives here.
  const { cardLabelOf } = useBanks()

  const query = useQuery({
    queryKey: [...PAYABLE_INVOICES_KEY, period],
    queryFn: async (): Promise<PayableInvoiceDTO[]> =>
      (await api().get<PayableInvoiceDTO[]>('/bank/card/invoice/payable', { params: { period } }))
        .data,
  })

  const setPaid = useMutation({
    mutationFn: async ({
      cardId,
      invoicePeriod,
      paid,
    }: {
      cardId: string
      // The month the invoice CLOSES in — its identity, which is not always the
      // month it is due in.
      invoicePeriod: string
      paid: boolean
    }) => {
      await api().post(`/bank/card/${cardId}/invoice/paid`, { period: invoicePeriod, paid })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYABLE_INVOICES_KEY }),
    onError: (error) => notifier.error(errorMessage(error, 'Não foi possível marcar a fatura.')),
  })

  const invoices = useMemo(() => query.data ?? [], [query.data])
  const pending = useMemo(() => invoices.filter((invoice) => !invoice.paid), [invoices])

  return {
    invoices,
    loading: query.isLoading,
    /** What the month still owes in invoices. Reported SEPARATELY from the
     * checklist's own total, never added to it. */
    totalCents: invoices.reduce((total, invoice) => total + invoice.amountCents, 0),
    pendingCents: pending.reduce((total, invoice) => total + invoice.amountCents, 0),
    setPaid: (cardId: string, invoicePeriod: string, paid: boolean) =>
      setPaid.mutate({ cardId, invoicePeriod, paid }),
    /** "Fatura Visa ····1234" — how the bill reads in the month's list. The
     * card's own name, because that is how it reads on a statement. */
    labelOf: (cardId: string) => `Fatura ${cardLabelOf(cardId)}`.trim(),
    /** "vence 18 set · fecha 11 set" while it is still open, and just the due
     * date once it has closed — before closing, saying when it closes is what
     * keeps a provisional figure from reading as final. */
    captionOf: (invoice: PayableInvoiceDTO) =>
      caption(
        `vence ${formatShortDay(invoice.dueOn)}`,
        !invoice.closed && `fecha ${formatShortDay(invoice.closesOn)}`,
      ),
  }
}
