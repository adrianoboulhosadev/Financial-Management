'use client'

import { mediaUrl } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { LogoutIcon } from '@/data/icons'
import { useProfile } from './hooks/use-profile'

/**
 * The account. The e-mail is shown but never editable — it is the identity the
 * session is issued against, and changing it is a different operation from
 * editing a display name.
 *
 * The nickname and the avatar are display-only: neither ever authenticates
 * anything, which is why they can be changed here with nothing more than a
 * logged-in session.
 */
export default function ProfilePage() {
  const page = useProfile()

  if (!page.user) return <Loading />

  const initials = (page.user.nickname || page.user.email).slice(0, 2).toUpperCase()

  return (
    <>
      <ScreenHeader title="Perfil" backHref="/more" />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
        <div className="flex flex-col items-center gap-2.5 pb-1 pt-2.5">
          <span className="grid h-[76px] w-[76px] flex-none place-items-center overflow-hidden rounded-full bg-accent-900 text-[25px] font-medium text-accent-200">
            {page.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl(page.user.avatarUrl)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </span>

          <p className="text-center text-[15px] font-medium">
            {page.user.nickname || page.user.email.split('@')[0]}
          </p>

          <label className="cursor-pointer rounded-field border border-accent-800 px-4 py-1.5 text-[11.5px] text-accent-200">
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

        <section>
          <Kicker className="pb-1.5">Dados</Kicker>
          <Pane className="px-4">
            <ListRow>
              <span className="flex-1 text-[13px]">E-mail</span>
              <span className="min-w-0 truncate text-[12.5px] text-neutral-500">
                {page.user.email}
              </span>
            </ListRow>
            <ListRow last>
              <div className="w-full">
                <Field
                  label="Apelido"
                  placeholder="Como você quer ser chamado"
                  value={page.nickname}
                  onChange={(event) => page.setNickname(event.target.value)}
                />
                <Button
                  className="mt-3 w-full"
                  onClick={page.saveProfile}
                  disabled={page.savingProfile}
                >
                  {page.savingProfile ? 'Salvando…' : 'Salvar'}
                </Button>
              </div>
            </ListRow>
          </Pane>
        </section>

        <section>
          <Kicker className="pb-1.5">Segurança</Kicker>
          <Pane className="px-4 py-4">
            <form onSubmit={page.changePassword} className="flex flex-col gap-4">
              <Field
                label="Senha atual"
                type="password"
                autoComplete="current-password"
                {...page.passwordForm.register('oldPassword', {
                  required: 'Informe a senha atual.',
                })}
                error={page.passwordForm.formState.errors.oldPassword?.message}
              />
              <Field
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                placeholder="8+ caracteres, maiúscula, número e símbolo"
                {...page.passwordForm.register('newPassword', {
                  required: 'Informe a nova senha.',
                })}
                error={page.passwordForm.formState.errors.newPassword?.message}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={page.passwordForm.formState.isSubmitting}
              >
                Alterar senha
              </Button>
            </form>
          </Pane>
        </section>

        <Pane>
          <button
            type="button"
            onClick={() => page.logout()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <LogoutIcon size={18} className="text-negative" />
            <span className="flex-1 text-[13px] text-negative">Sair da conta</span>
          </button>
        </Pane>
      </div>
    </>
  )
}
