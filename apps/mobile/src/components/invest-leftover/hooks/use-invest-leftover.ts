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
export function useInvestLeftover(leftoverCents: number) {
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
    /**
     * `all` fills in the whole leftover. It is still a DECISION — the owner
     * pressed a button that says "tudo" — which is the difference between this
     * and a field that arrives pre-filled with a number nobody chose.
     */
    openPanel: (all = false) => {
      setOpen(true)
      setAmount(all && leftoverCents > 0 ? (leftoverCents / 100).toFixed(2).replace('.', ',') : '')
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
