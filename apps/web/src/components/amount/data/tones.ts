/**
 * Como o valor é colorido. `movement` lê o SINAL do próprio número (uma sobra,
 * um saldo de orçamento); `expense`/`income` dizem a direção explicitamente,
 * porque um valor gravado é sempre magnitude positiva e só o tipo do lançamento
 * conta pra que lado ele foi.
 */
export type AmountTone = 'movement' | 'expense' | 'income' | 'neutral'

/** As duas únicas cores saturadas do produto, mais o neutro. */
export const TONE_CLASSES: Record<Exclude<AmountTone, 'movement'>, string> = {
  income: 'text-positive',
  expense: 'text-negative',
  neutral: 'text-ink-text',
}
