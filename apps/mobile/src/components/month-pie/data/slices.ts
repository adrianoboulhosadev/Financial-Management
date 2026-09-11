import { SEMANTIC } from 'ui'

/**
 * The three things a month's income turns into — the SAME keys, labels and
 * token colours as the web's pie, which is the only thing keeping the two
 * charts from drifting into different stories about one month.
 */
export type MonthSliceKey = 'fixed' | 'variable' | 'leftover'

export interface MonthSlice {
  key: MonthSliceKey
  label: string
  fill: string
  swatch: string
}

export const MONTH_SLICES: MonthSlice[] = [
  { key: 'fixed', label: 'Fixos do mês', fill: SEMANTIC.warning, swatch: 'bg-warning' },
  { key: 'variable', label: 'Gastos avulsos', fill: SEMANTIC.negative, swatch: 'bg-negative' },
  { key: 'leftover', label: 'Sobra', fill: SEMANTIC.positive, swatch: 'bg-positive' },
]
