/**
 * The three things a month's income turns into. The colours are the product's
 * SEMANTIC tokens used for exactly what they mean — money going out
 * (`negative`), a bill already promised (`warning`), and what survives
 * (`positive`) — never a palette picked to tell three series apart.
 *
 * Each segment also carries a label and a value on screen, so identity never
 * rests on colour alone.
 */
export type MonthSplitKey = 'fixed' | 'variable' | 'leftover'

export const MONTH_SPLIT_SEGMENTS: { key: MonthSplitKey; label: string; className: string }[] = [
  { key: 'fixed', label: 'Fixos do mês', className: 'bg-warning' },
  { key: 'variable', label: 'Gastos avulsos', className: 'bg-negative' },
  { key: 'leftover', label: 'Sobra', className: 'bg-positive' },
]

/** The legend swatch next to each label — the same colour as the segment, so
 * the two are matched by position AND by hue. */
export const MONTH_SPLIT_SWATCHES: Record<MonthSplitKey, string> = {
  fixed: 'bg-warning',
  variable: 'bg-negative',
  leftover: 'bg-positive',
}
