/**
 * The banks the "novo banco" form offers as suggestions. A STATIC list, and
 * deliberately so: a public bank registry would be one more service that has to
 * be up for the form to work, and the point here is only to spare the owner
 * from typing "Bradesco" — the name is free text either way, so anything not on
 * the list is still perfectly registerable.
 *
 * Ordered by how likely someone is to bank there, not alphabetically: the list
 * exists to be picked from at a glance.
 */
export const BANK_SUGGESTIONS: readonly string[] = [
  'Nubank',
  'Itaú',
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica Federal',
  'Santander',
  'Inter',
  'C6 Bank',
  'BTG Pactual',
  'Banco Original',
  'Sicredi',
  'Sicoob',
  'Banrisul',
  'Safra',
  'PagBank',
  'Mercado Pago',
  'PicPay',
  'Neon',
  'Will Bank',
  'XP Investimentos',
  'Rico',
  'Banco Pan',
  'BMG',
  'Daycoval',
]
