/** A régua colorida à esquerda do card — é o que torna os três números do topo
 * distinguíveis de relance sem pintar o card inteiro. */
export type StatCardAccent = 'positive' | 'negative' | 'accent' | 'none'

export const ACCENT_CLASSES: Record<StatCardAccent, string> = {
  positive: 'border-l-positive',
  negative: 'border-l-negative',
  accent: 'border-l-accent',
  none: 'border-l-ink-border',
}
