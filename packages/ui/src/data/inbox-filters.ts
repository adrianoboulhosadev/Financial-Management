export type InboxFilter = 'all' | 'unread'

export const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
]

/** How many lines the inbox screen pulls. The bell asks for far fewer. */
export const INBOX_SIZE = 100
