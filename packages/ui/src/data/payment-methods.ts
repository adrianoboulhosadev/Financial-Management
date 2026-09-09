import type { PaymentMethod } from '@transaction/adapters'

/**
 * How a movement was paid, as the forms offer it. The union comes from the
 * DOMAIN (`PaymentMethod`) — this table only labels it, so a screen can never
 * offer a method the backend would refuse.
 */
export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'ted', label: 'TED / transferência' },
  { value: 'cash', label: 'Dinheiro' },
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  debit: 'Débito',
  credit: 'Crédito',
  boleto: 'Boleto',
  ted: 'TED',
  cash: 'Dinheiro',
}

/** How a movement's payment reads in a listing. Null is the ordinary state for
 * anything recorded before banks existed, and saying nothing beats saying
 * "sem forma de pagamento". */
export function paymentMethodLabel(method: PaymentMethod | null): string {
  return method ? PAYMENT_METHOD_LABELS[method] : ''
}

/**
 * The methods that settle on their own on the due date. The forms use it to
 * pre-tick "pagamento automático" when the owner picks pix or debit — which is
 * the answer they were going to give anyway.
 */
export const SELF_SETTLING_PAYMENT_METHODS: readonly PaymentMethod[] = ['pix', 'debit', 'boleto']
