import { SEMANTIC } from 'ui'

/**
 * The three things a month's income turns into. The colours are the product's
 * SEMANTIC tokens used for exactly what they mean — a bill already promised
 * (`warning`), money going out (`negative`), and what survives (`positive`) —
 * never a palette picked to tell three series apart.
 *
 * Each slice also carries a label and a value on screen, so identity never
 * rests on colour alone.
 */
export type MonthSliceKey = 'fixed' | 'variable' | 'leftover'

export interface MonthSlice {
  key: MonthSliceKey
  label: string
  /** The literal fill for the SVG wedge: an `<svg>` fill cannot be a Tailwind
   * class, so it reads the token it would have compiled to. */
  fill: string
  /** The legend swatch, which CAN be a class and so stays a utility. */
  swatch: string
}

export const MONTH_SLICES: MonthSlice[] = [
  { key: 'fixed', label: 'Fixos do mês', fill: SEMANTIC.warning, swatch: 'bg-warning' },
  { key: 'variable', label: 'Gastos avulsos', fill: SEMANTIC.negative, swatch: 'bg-negative' },
  { key: 'leftover', label: 'Sobra', fill: SEMANTIC.positive, swatch: 'bg-positive' },
]
