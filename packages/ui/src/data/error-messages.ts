import { Errors } from 'shared'

// Friendly messages per domain code — STATIC data. The KEYS come from `shared`
// (single source of the codes); only the display text lives here (pt-BR for
// users). Shared by both apps: an error must read the same on the phone and in
// the browser.
export const ERROR_MESSAGES: Record<string, string> = {
  // shared
  [Errors.REQUIRED_FIELD]: 'Preencha todos os campos obrigatórios.',
  [Errors.INVALID_AMOUNT]: 'Valor inválido.',
  [Errors.INVALID_PERIOD]: 'Mês inválido.',
  [Errors.PERIOD_BEFORE_ACCOUNT_START]: 'Esse mês é anterior à criação da sua conta.',
  // auth
  [Errors.INVALID_EMAIL]: 'E-mail inválido.',
  [Errors.WEAK_PASSWORD]: 'A senha deve ter 8+ caracteres, com maiúscula, número e símbolo.',
  [Errors.USER_ALREADY_EXISTS]: 'Já existe uma conta com este e-mail.',
  [Errors.USER_NOT_FOUND]: 'Usuário não encontrado.',
  [Errors.INVALID_EMAIL_OR_PASSWORD]: 'E-mail ou senha inválidos.',
  [Errors.INVALID_PASSWORD]: 'Senha incorreta.',
  [Errors.PASSWORD_SAME_AS_PREVIOUS]: 'A nova senha deve ser diferente da anterior.',
  [Errors.NOT_AUTHENTICATED]: 'Sua sessão expirou. Entre novamente.',
  [Errors.INVALID_SESSION]: 'Sua sessão expirou. Entre novamente.',
  [Errors.OAUTH_TOKEN_INVALID]: 'Não foi possível validar seu login com o Google.',
  [Errors.OAUTH_EMAIL_NOT_VERIFIED]: 'O Google não confirmou este e-mail. Use e-mail e senha.',
  // category
  [Errors.CATEGORY_NOT_FOUND]: 'Categoria não encontrada.',
  [Errors.CATEGORY_HAS_CHILDREN]: 'Só é possível excluir uma categoria sem subcategorias.',
  [Errors.CATEGORY_ALREADY_EXISTS]: 'Já existe uma categoria com esse nome aqui.',
  [Errors.CATEGORY_IN_USE]: 'Esta categoria já tem lançamentos, recorrência ou orçamento.',
  // transaction
  [Errors.TRANSACTION_NOT_FOUND]: 'Lançamento não encontrado.',
  [Errors.INVALID_TRANSACTION_TYPE]: 'Escolha se o lançamento é uma despesa ou uma receita.',
  [Errors.CATEGORY_REQUIRED_FOR_EXPENSE]: 'Toda despesa precisa de uma categoria.',
  [Errors.RECURRENCE_NOT_FOUND]: 'Lançamento fixo não encontrado.',
  [Errors.RECURRENCE_NOT_ACTIVE]: 'Este lançamento fixo está pausado.',
  [Errors.INVALID_DAY_OF_MONTH]: 'O dia do mês precisa estar entre 1 e 31.',
  [Errors.INVALID_RECURRENCE_DURATION]: 'A duração precisa ser um número de meses maior que zero.',
  [Errors.RECURRENCE_NOT_VARIABLE]:
    'Só um fixo marcado como de valor variável aceita ajuste de valor no mês.',
  [Errors.INVALID_PAYMENT_METHOD]: 'Escolha uma forma de pagamento válida.',
  [Errors.INVALID_INSTALLMENTS]: 'O número de parcelas precisa estar entre 1 e 48.',
  [Errors.INSTALLMENTS_REQUIRE_CREDIT]: 'Só compras no crédito podem ser parceladas.',
  // budget
  [Errors.BUDGET_NOT_FOUND]: 'Orçamento não encontrado.',
  [Errors.BUDGET_ALREADY_EXISTS]: 'Esta categoria já tem um orçamento.',
  // bank
  [Errors.BANK_NOT_FOUND]: 'Banco não encontrado.',
  [Errors.BANK_ALREADY_EXISTS]: 'Você já cadastrou um banco com esse nome.',
  [Errors.BANK_IN_USE]: 'Este banco ainda tem cartões, lançamentos ou investimentos.',
  [Errors.CARD_NOT_FOUND]: 'Cartão não encontrado.',
  [Errors.CARD_ALREADY_EXISTS]: 'Você já cadastrou um cartão com esses 4 dígitos neste banco.',
  [Errors.CARD_IN_USE]: 'Este cartão já tem lançamentos.',
  [Errors.INVALID_CARD_KIND]: 'Escolha se o cartão é de débito, crédito ou os dois.',
  [Errors.INVALID_CARD_BRAND]: 'Escolha a bandeira do cartão.',
  [Errors.INVALID_CARD_LAST_DIGITS]: 'Informe os 4 últimos dígitos do cartão.',
  // investment
  [Errors.INVESTMENT_NOT_FOUND]: 'Investimento não encontrado.',
  [Errors.INVESTMENT_ALREADY_EXISTS]: 'Você já tem um investimento com esse nome.',
  [Errors.INVALID_INVESTMENT_KIND]: 'Escolha um tipo de investimento válido.',
  [Errors.INVESTMENT_NOT_ACTIVE]: 'Este investimento está resgatado. Reative antes de aportar.',
  // income
  [Errors.INCOME_SOURCE_NOT_FOUND]: 'Fonte de renda não encontrada.',
  [Errors.INCOME_SOURCE_ALREADY_EXISTS]: 'Você já tem uma fonte de renda com esse nome.',
  [Errors.INVALID_PAYDAY]: 'O dia do recebimento precisa estar entre 1 e 31.',
  // notification
  [Errors.NOTIFICATION_NOT_FOUND]: 'Notificação não encontrada.',
}
