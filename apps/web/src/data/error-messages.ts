import { Errors } from 'shared'

// Friendly messages per domain code — STATIC data. The KEYS come from `shared`
// (single source of the codes); only the display text lives here (pt-BR for users).
export const ERROR_MESSAGES: Record<string, string> = {
  // shared
  [Errors.REQUIRED_FIELD]: 'Preencha todos os campos obrigatórios.',
  [Errors.INVALID_AMOUNT]: 'Valor inválido.',
  [Errors.INVALID_PERIOD]: 'Mês inválido.',
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
  [Errors.NOT_ADMIN]: 'Ação restrita ao administrador.',
  [Errors.ACCOUNT_PENDING_APPROVAL]:
    'Seu cadastro ainda não foi aprovado. Assim que o administrador liberar, você consegue entrar.',
  [Errors.OAUTH_TOKEN_INVALID]: 'Não foi possível validar seu login com o Google.',
  [Errors.OAUTH_EMAIL_NOT_VERIFIED]: 'O Google não confirmou este e-mail. Use e-mail e senha.',
  // category
  [Errors.CATEGORY_NOT_FOUND]: 'Categoria não encontrada.',
  [Errors.CATEGORY_NOT_LEAF]: 'Escolha a categoria até o nível mais específico.',
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
  // budget
  [Errors.BUDGET_NOT_FOUND]: 'Orçamento não encontrado.',
  [Errors.BUDGET_ALREADY_EXISTS]: 'Esta categoria já tem um orçamento.',
  // income
  [Errors.INCOME_SOURCE_NOT_FOUND]: 'Fonte de renda não encontrada.',
  [Errors.INCOME_SOURCE_ALREADY_EXISTS]: 'Você já tem uma fonte de renda com esse nome.',
  [Errors.INVALID_PAYDAY]: 'O dia do recebimento precisa estar entre 1 e 31.',
  // notification
  [Errors.NOTIFICATION_NOT_FOUND]: 'Notificação não encontrada.',
}
