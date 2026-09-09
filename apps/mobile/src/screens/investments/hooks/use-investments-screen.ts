import { useState } from 'react'
import type { InvestmentDTO } from '@investment/adapters'

import { toCents, toDateInputValue, useBanks, useInvestments } from 'ui'

/**
 * The screen's own state (the form sheet, which investment is having its value
 * typed, what is about to be deleted) composed with the shared data hook — the
 * same split the web makes, with the form living here because on a phone it is
 * a sheet the screen opens.
 */
export function useInvestmentsScreen() {
  const data = useInvestments()
  const { banks, bankNameOf } = useBanks()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftValue, setDraftValue] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<InvestmentDTO | null>(null)

  const [name, setName] = useState('')
  const [kind, setKind] = useState('cdb')
  const [bankId, setBankId] = useState('')
  const [investedAmount, setInvestedAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [startedOn, setStartedOn] = useState(() => toDateInputValue())
  const [maturityOn, setMaturityOn] = useState('')
  const [notes, setNotes] = useState('')

  const resetForm = () => {
    setName('')
    setKind('cdb')
    setBankId('')
    setInvestedAmount('')
    setCurrentAmount('')
    setStartedOn(toDateInputValue())
    setMaturityOn('')
    setNotes('')
  }

  const closeEditor = () => {
    setEditingId(null)
    setDraftValue('')
  }

  return {
    investments: data.investments,
    portfolio: data.portfolio,
    loading: data.loading,
    banks,
    bankNameOf,

    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => {
      setFormOpen(false)
      resetForm()
    },
    name,
    setName,
    kind,
    setKind,
    bankId,
    setBankId,
    investedAmount,
    setInvestedAmount,
    currentAmount,
    setCurrentAmount,
    startedOn,
    setStartedOn,
    maturityOn,
    setMaturityOn,
    notes,
    setNotes,
    canSubmit: Boolean(name.trim() && investedAmount && startedOn),
    creating: data.creating,
    submit: () => {
      data.create({
        name,
        kind,
        bankId: bankId || null,
        investedAmount: toCents(investedAmount),
        // Absent means "worth what went in" to the domain, which is not the
        // same as being worth zero.
        currentAmount: currentAmount ? toCents(currentAmount) : null,
        startedOn,
        maturityOn: maturityOn || null,
        notes: notes.trim() || null,
      })
      setFormOpen(false)
      resetForm()
    },

    editingId,
    draftValue,
    setDraftValue,
    /** Opens pre-filled with what it is worth today, so a monthly update is a
     * two-character edit rather than retyping the figure. */
    startEditing: (investment: InvestmentDTO) => {
      setEditingId(investment.id)
      const cents = investment.currentAmount ?? investment.investedAmount
      setDraftValue((cents / 100).toFixed(2).replace('.', ','))
    },
    cancelEditing: closeEditor,
    confirmEditing: () => {
      if (!editingId) return
      data.updateValue(editingId, toCents(draftValue))
      closeEditor()
    },

    toggleActive: data.toggleActive,
    pendingDeletion,
    askToDelete: setPendingDeletion,
    cancelDeletion: () => setPendingDeletion(null),
    confirmDeletion: () => {
      if (!pendingDeletion) return
      data.remove(pendingDeletion.id)
      setPendingDeletion(null)
    },
    /** What one investment made so far, in cents. SIGNED, because a loss is
     * exactly what has to be visible. */
    returnOf: (investment: InvestmentDTO) =>
      (investment.currentAmount ?? investment.investedAmount) - investment.investedAmount,
  }
}
