import { useState } from 'react'

import { toCents, toDateInputValue, useInvestments } from 'ui'

/**
 * Turning part of a month's leftover into a contribution. It owns the little
 * form and nothing else — the write itself is the shared investments hook, the
 * same one the investments screen uses.
 *
 * The amount starts EMPTY rather than pre-filled with the whole leftover: the
 * point of the panel is deciding how much of it to put away, and a pre-filled
 * total is a number people accept without deciding.
 */
export function useInvestLeftover() {
  const { investments, contribute, contributing } = useInvestments()
  const [open, setOpen] = useState(false)
  const [investmentId, setInvestmentId] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => toDateInputValue())

  const close = () => {
    setOpen(false)
    setAmount('')
  }

  // Only what is still open can receive money — a redeemed investment is
  // refused by the domain, so it is not offered here either.
  const options = investments.filter((investment) => investment.active)

  return {
    open,
    options,
    hasInvestments: options.length > 0,
    openPanel: () => {
      setOpen(true)
      // One investment is not a choice — pre-select it and let the owner just
      // type the amount.
      if (!investmentId && options.length === 1) setInvestmentId(options[0].id)
    },
    close,
    investmentId,
    setInvestmentId,
    amount,
    setAmount,
    occurredOn,
    setOccurredOn,
    contributing,
    canSubmit: Boolean(investmentId && amount && Number(amount.replace(',', '.')) > 0),
    submit: () => {
      contribute({ id: investmentId, amount: toCents(amount), occurredOn })
      close()
    },
  }
}
