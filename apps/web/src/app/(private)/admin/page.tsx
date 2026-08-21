'use client'

import type { UserDTO } from '@auth/adapters'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { Loading } from '@/components/loading'
import { formatDate } from 'ui'
import { APPROVAL_STATUS_CLASSES, APPROVAL_STATUS_LABELS } from 'ui'
import { useAdmin } from './hooks/use-admin'

export default function AdminPage() {
  const page = useAdmin()

  if (page.loading) return <Loading />

  const row = (user: UserDTO) => (
    <li key={user.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.nickname || user.email}</p>
        <p className="mt-0.5 text-xs text-ink-text-muted">
          {user.email} · desde {formatDate(user.createdAt)}
          {user.role === 'admin' && ' · admin'}
        </p>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-xs ${APPROVAL_STATUS_CLASSES[user.approvalStatus]}`}
      >
        {APPROVAL_STATUS_LABELS[user.approvalStatus]}
      </span>

      {user.approvalStatus !== 'approved' && (
        <Button onClick={() => page.approve(user.id)} disabled={page.deciding}>
          Liberar
        </Button>
      )}
      {user.approvalStatus !== 'rejected' && (
        <Button variant="danger" onClick={() => page.reject(user.id)} disabled={page.deciding}>
          Bloquear
        </Button>
      )}
    </li>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Aguardando liberação</h2>
        {page.pending.length === 0 ? (
          <EmptyState title="Ninguém na fila" description="Todo cadastro novo aparece aqui." />
        ) : (
          <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
            {page.pending.map(row)}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Contas</h2>
        <p className="text-xs text-ink-text-soft">
          Bloquear também revoga o acesso de quem já está dentro: as sessões abertas caem na hora.
        </p>
        <ul className="divide-y divide-ink-border overflow-hidden rounded-card border border-ink-border bg-ink-surface">
          {page.others.map(row)}
        </ul>
      </section>
    </div>
  )
}
