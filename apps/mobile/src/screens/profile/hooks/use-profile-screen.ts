import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api, errorMessage, useAuth } from 'client'
import { notify } from '@/lib/notify'

interface PasswordForm {
  oldPassword: string
  newPassword: string
}

export function useProfileScreen() {
  const { user, refresh } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [saving, setSaving] = useState(false)
  const passwordForm = useForm<PasswordForm>({ defaultValues: { oldPassword: '', newPassword: '' } })

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api().patch('/user/me', { nickname: nickname.trim() || null })
      await refresh()
      notify.success('Perfil atualizado.')
    } catch (error) {
      notify.error(errorMessage(error, 'Não foi possível salvar o perfil.'))
    } finally {
      setSaving(false)
    }
  }

  const changePassword = passwordForm.handleSubmit(async (input) => {
    try {
      await api().patch('/user/change-password', input)
      passwordForm.reset()
      notify.success('Senha alterada.')
    } catch (error) {
      notify.error(errorMessage(error, 'Não foi possível alterar a senha.'))
    }
  })

  return { user, nickname, setNickname, saveProfile, saving, passwordForm, changePassword }
}
