import { useState } from 'react'
import type { RecurrenceDTO, TransactionType } from '@transaction/adapters'

import {
  SCHEDULE_GROUPS,
  SELF_SETTLING_PAYMENT_METHODS,
  caption,
  paymentMethodLabel,
  scheduleGroupOf,
  toCents,
  useBanks,
  useCategories,
  useIncome,
  useRecurrences,
} from 'ui'

export function useRecurrencesScreen() {
  const data = useRecurrences()
  const { pathOf } = useCategories()
  const { bankNameOf, cardLabelOf } = useBanks()
  const [formOpen, setFormOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('5')
  const [variableAmount, setVariableAmount] = useState(false)
  const [hasDeadline, setHasDeadline] = useState(false)
  const [durationMonths, setDurationMonths] = useState('12')
  const [autoPaid, setAutoPaid] = useState(false)
  const [bankId, setBankId] = useState('')
  const [cardId, setCardId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState<RecurrenceDTO | null>(null)
  // What the commitments cost as a share of what comes in — the one number that
  // says whether the list below is comfortable or alarming.
  const { monthlyTotal } = useIncome()

  const monthlyCents = data.recurrences
    .filter((recurrence) => recurrence.type === 'expense' && recurrence.active)
    .reduce((sum, recurrence) => sum + recurrence.amount, 0)

  return {
    recurrences: data.recurrences,
    /** The list split into the blocks the screen shows, empty ones dropped so a
     * heading never introduces nothing. The SAME grouping the web uses. */
    groups: SCHEDULE_GROUPS.map((group) => ({
      ...group,
      items: data.recurrences.filter((recurrence) => scheduleGroupOf(recurrence) === group.key),
    })).filter((group) => group.items.length > 0),
    monthlyCents,
    /** How much of the month's income is already spoken for. Null without a
     * declared income — a percentage of nothing is not a fact. */
    incomeShare: monthlyTotal > 0 ? Math.round((monthlyCents / monthlyTotal) * 100) : null,
    loading: data.loading,
    creating: data.creating,
    formOpen,
    openForm: () => setFormOpen(true),
    closeForm: () => setFormOpen(false),
    type,
    setType,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    amount,
    setAmount,
    dayOfMonth,
    setDayOfMonth,
    variableAmount,
    setVariableAmount,
    hasDeadline,
    setHasDeadline,
    durationMonths,
    setDurationMonths,
    autoPaid,
    setAutoPaid,
    bankId,
    setBankId,
    cardId,
    setCardId,
    paymentMethod,
    /**
     * Picking pix or direct debit pre-ticks "já é pago automaticamente": it is
     * the answer the owner was going to give anyway, and they can still untick
     * it. Going back to cash or credit unticks it, because those need somebody
     * to actually pay.
     */
    setPaymentMethod: (method: string) => {
      setPaymentMethod(method)
      setAutoPaid(SELF_SETTLING_PAYMENT_METHODS.includes(method as never))
    },
    categoryRequired: type === 'expense',
    canSubmit: Boolean(description.trim() && amount && (type !== 'expense' || categoryId)),
    submit: () => {
      data.create({
        type,
        categoryId: categoryId || null,
        description,
        amount: toCents(amount),
        dayOfMonth: Number(dayOfMonth),
        variableAmount,
        // A count, not a date: months is what the owner knows, and turning it
        // into a deadline is the domain's job.
        durationMonths: hasDeadline ? Number(durationMonths) || null : null,
        autoPaid,
        bankId: bankId || null,
        cardId: cardId || null,
        paymentMethod: paymentMethod || null,
      })
      setFormOpen(false)
      setDescription('')
      setAmount('')
      setCategoryId('')
      setVariableAmount(false)
      setHasDeadline(false)
      setDurationMonths('12')
      setAutoPaid(false)
      setBankId('')
      setCardId('')
      setPaymentMethod('')
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
    labelFor: (id: string | null) => (id ? pathOf(id) : 'Sem categoria'),
    /** "até 04/2027" — what a bill with a deadline says next to its day, so it
     * is clear it is not forever. */
    deadlineLabelFor: (recurrence: RecurrenceDTO): string =>
      recurrence.endsOn
        ? `até ${new Date(recurrence.endsOn).toLocaleDateString('pt-BR', {
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
          })}`
        : '',
    /** The line under a fixed bill: which day, how it is paid, and where it is
     * filed — the same caption the web builds, minus the instalments a
     * recurrence can never have. */
    captionFor: (recurrence: RecurrenceDTO): string =>
      caption(
        `dia ${String(recurrence.dayOfMonth).padStart(2, '0')}`,
        recurrence.autoPaid
          ? 'pagamento automático'
          : caption(
              paymentMethodLabel(recurrence.paymentMethod),
              cardLabelOf(recurrence.cardId) || bankNameOf(recurrence.bankId),
            ),
        recurrence.categoryId ? pathOf(recurrence.categoryId) : null,
        // A variable bill's amount is only an estimate until the real one
        // arrives, and saying so keeps the figure beside it from being read as
        // settled.
        recurrence.variableAmount && 'valor variável',
        !recurrence.active && 'pausado',
      ),
  }
}
