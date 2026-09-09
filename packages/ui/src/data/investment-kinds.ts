import type { InvestmentKind } from '@investment/adapters'

/** Where the money was put, as the form offers it. The union is the domain's
 * (`InvestmentKind`); this only labels it, so a screen can never offer a kind
 * the backend would refuse. */
export const INVESTMENT_KIND_OPTIONS: { value: InvestmentKind; label: string }[] = [
  { value: 'savings', label: 'Poupança' },
  { value: 'cdb', label: 'CDB' },
  { value: 'lci_lca', label: 'LCI / LCA' },
  { value: 'treasury', label: 'Tesouro Direto' },
  { value: 'fund', label: 'Fundo de investimento' },
  { value: 'stocks', label: 'Ações' },
  { value: 'reit', label: 'Fundos imobiliários' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'pension', label: 'Previdência' },
  { value: 'other', label: 'Outro' },
]

export const INVESTMENT_KIND_LABELS: Record<InvestmentKind, string> = {
  savings: 'Poupança',
  cdb: 'CDB',
  lci_lca: 'LCI / LCA',
  treasury: 'Tesouro Direto',
  fund: 'Fundo de investimento',
  stocks: 'Ações',
  reit: 'Fundos imobiliários',
  crypto: 'Criptomoedas',
  pension: 'Previdência',
  other: 'Outro',
}
