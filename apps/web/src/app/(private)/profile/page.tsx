'use client'

import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { mediaUrl } from 'ui'
import { useProfile } from './hooks/use-profile'

export default function ProfilePage() {
  const page = useProfile()

  if (!page.user) return <Loading />

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <section className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Perfil</h2>

        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-full bg-ink-surface-soft text-lg font-medium text-ink-text-soft">
            {page.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(page.user.avatarUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              (page.user.nickname || page.user.email).slice(0, 2).toUpperCase()
            )}
          </span>

          <label className="cursor-pointer text-sm text-accent hover:underline">
            {page.uploading ? 'Enviando…' : 'Trocar foto'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={page.uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) page.uploadAvatar(file)
                // Cleared so picking the SAME file again still fires a change.
                event.target.value = ''
              }}
            />
          </label>
        </div>

        <Field label="E-mail" value={page.user.email} readOnly disabled />
        <Field
          label="Apelido"
          placeholder="Como você quer ser chamado"
          value={page.nickname}
          onChange={(event) => page.setNickname(event.target.value)}
        />

        <Button onClick={page.saveProfile} disabled={page.savingProfile}>
          {page.savingProfile ? 'Salvando…' : 'Salvar'}
        </Button>
      </section>

      <form
        onSubmit={page.changePassword}
        className="space-y-4 rounded-card border border-ink-border bg-ink-surface p-5 shadow-card"
      >
        <h2 className="text-sm font-semibold">Alterar senha</h2>

        <Field
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          {...page.passwordForm.register('oldPassword', { required: 'Informe a senha atual.' })}
          error={page.passwordForm.formState.errors.oldPassword?.message}
        />
        <Field
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="8+ caracteres, maiúscula, número e símbolo"
          {...page.passwordForm.register('newPassword', { required: 'Informe a nova senha.' })}
          error={page.passwordForm.formState.errors.newPassword?.message}
        />

        <Button type="submit" disabled={page.passwordForm.formState.isSubmitting}>
          Alterar senha
        </Button>
      </form>
    </div>
  )
}
