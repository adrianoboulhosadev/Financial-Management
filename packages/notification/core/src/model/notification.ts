import { Entity, EntityProps, Money, ValidationError, Errors } from 'shared'
import { NotificationInput, NotificationType, NOTIFICATION_TYPES } from './notification-input'

export interface NotificationProps extends EntityProps {
  userId?: string
  type?: NotificationType
  title?: string
  body?: string
  /** Where clicking it takes the user (a front route). Null = nowhere to go. */
  link?: string | null
  referenceId?: string | null
  readAt?: Date | null
  createdAt?: Date
}

/** Formats cents as BRL without relying on Intl's locale data (which would
 * vary between the API container and the worker). Money already guarantees a
 * non-negative integer. */
function formatMoney(cents: number): string {
  const [reais, centavos] = (new Money(cents).cents / 100).toFixed(2).split('.')
  return `R$ ${reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${centavos}`
}

/**
 * One line in a user's inbox (rich entity).
 *
 * The COPY lives here, not in the callers: two different apps raise
 * notifications (backend on an admin action, worker on a budget check or a
 * posted recurrence), and
 * `Notification.for` is what keeps "what we tell the user" a single decision
 * of the domain instead of strings scattered across controllers. The text is
 * stored already rendered — a notification is a record of what was said at the
 * time, so a later wording change never rewrites history.
 */
export class Notification extends Entity<Notification, NotificationProps> {
  readonly userId: string
  readonly type: NotificationType
  readonly title: string
  readonly body: string
  readonly link: string | null
  readonly referenceId: string | null
  readonly createdAt: Date
  readAt: Date | null

  constructor(props: NotificationProps) {
    super(props)
    const userId = props.userId?.trim() ?? ''
    if (!userId) ValidationError.throwError(Errors.REQUIRED_FIELD, 'userId')

    const title = props.title?.trim() ?? ''
    if (!title) ValidationError.throwError(Errors.REQUIRED_FIELD, 'title')

    const body = props.body?.trim() ?? ''
    if (!body) ValidationError.throwError(Errors.REQUIRED_FIELD, 'body')

    if (!props.type || !NOTIFICATION_TYPES.includes(props.type)) {
      ValidationError.throwError(Errors.REQUIRED_FIELD, 'type')
    }

    this.userId = userId
    this.type = props.type
    this.title = title
    this.body = body
    this.link = props.link ?? null
    this.referenceId = props.referenceId ?? null
    this.readAt = props.readAt ?? null
    this.createdAt = props.createdAt ?? new Date()
  }

  get isRead(): boolean {
    return this.readAt !== null
  }

  /** Idempotent: re-reading an already-read notification keeps the original
   * timestamp (marking all as read must not rewrite the whole inbox). */
  markAsRead(): void {
    if (this.readAt) return
    this.readAt = new Date()
  }

  /** Builds the finished notification for an event. Every branch is exhaustive
   * over NotificationInput, so adding a type without its copy fails the build. */
  static for(input: NotificationInput): Notification {
    const { title, body, link } = Notification.render(input)
    return new Notification({
      userId: input.userId,
      type: input.type,
      referenceId: input.referenceId,
      title,
      body,
      link,
    })
  }

  private static render(input: NotificationInput): {
    title: string
    body: string
    link: string | null
  } {
    switch (input.type) {
      case 'budget_warning':
        return {
          title: 'Orçamento quase no limite',
          body: `Você já usou ${input.percentage}% do orçamento de "${input.categoryName}": ${formatMoney(input.spentCents)} de ${formatMoney(input.limitCents)}.`,
          link: '/budgets',
        }
      case 'budget_exceeded':
        return {
          title: 'Orçamento estourado',
          body: `"${input.categoryName}" passou do teto de ${formatMoney(input.limitCents)} — o gasto do mês já está em ${formatMoney(input.spentCents)}.`,
          link: '/budgets',
        }
      case 'recurrence_posted':
        return {
          title: input.movement === 'expense' ? 'Despesa fixa lançada' : 'Receita fixa lançada',
          body: `"${input.description}" de ${formatMoney(input.amount)} entrou no mês automaticamente.`,
          link: '/transactions',
        }
      case 'account_approved':
        return {
          title: 'Conta liberada',
          body: 'Seu cadastro foi aprovado. Bem-vindo ao Financial!',
          link: '/dashboard',
        }
      // The signup notice carries the e-mail on purpose: it goes only to admins,
      // and it is the same reason the control room shows it — without it the
      // owner cannot tell who is asking to get in.
      case 'admin_signup_pending':
        return {
          title: 'Novo cadastro',
          body: `${input.signupEmail} se cadastrou e está esperando aprovação.`,
          link: '/admin',
        }
    }
  }
}
