'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api, useAuth } from 'client'
import { notify } from '@/lib/notify'

interface PasswordForm {
  oldPassword: string
  newPassword: string
}

export function useProfile() {
  const { user, refresh } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const passwordForm = useForm<PasswordForm>({ defaultValues: { oldPassword: '', newPassword: '' } })

  const saveProfile = async (avatarUrl?: string) => {
    setSavingProfile(true)
    try {
      await api().patch('/user/me', { nickname: nickname.trim() || null, avatarUrl })
      await refresh()
      notify.success('Perfil atualizado.')
    } catch (error) {
      notify.failure(error, 'Não foi possível salvar o perfil.')
    } finally {
      setSavingProfile(false)
    }
  }

  // The file is uploaded FIRST and only its URL is saved on the user — same
  // two-step the receipt upload uses.
  const uploadAvatar = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await api().post<{ url: string }>('/upload/avatars', body)
      await saveProfile(data.url)
    } catch (error) {
      notify.failure(error, 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  const changePassword = passwordForm.handleSubmit(async (input) => {
    try {
      await api().patch('/user/change-password', input)
      passwordForm.reset()
      notify.success('Senha alterada.')
    } catch (error) {
      notify.failure(error, 'Não foi possível alterar a senha.')
    }
  })

  return {
    user,
    nickname,
    setNickname,
    saveProfile: () => saveProfile(),
    savingProfile,
    uploadAvatar,
    uploading,
    passwordForm,
    changePassword,
  }
}
