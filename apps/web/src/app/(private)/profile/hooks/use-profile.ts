'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api, discardAvatar, uploadAvatar as sendAvatar, useAuth } from 'ui'
import { notify } from '@/lib/notify'

interface PasswordForm {
  oldPassword: string
  newPassword: string
}

export function useProfile() {
  const { user, refresh, logout } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const passwordForm = useForm<PasswordForm>({
    defaultValues: { oldPassword: '', newPassword: '' },
  })

  /** Answers whether it actually saved, which is what tells the avatar upload
   * below which of the two files is now the orphan. */
  const saveProfile = async (avatarUrl?: string): Promise<boolean> => {
    setSavingProfile(true)
    try {
      await api().patch('/user/me', { nickname: nickname.trim() || null, avatarUrl })
      await refresh()
      notify.success('Perfil atualizado.')
      return true
    } catch (error) {
      notify.failure(error, 'Não foi possível salvar o perfil.')
      return false
    } finally {
      setSavingProfile(false)
    }
  }

  /**
   * The file is uploaded FIRST and only its URL is saved on the user — the same
   * two-step the receipt upload uses.
   *
   * Only the FAILED case is cleaned up here: a photo that went up while the
   * profile kept naming the old one is a file nothing will ever point at, and
   * this is the only place that knows it happened. The OLD photo is swept up by
   * the backend when the profile releases it, because the moment a record stops
   * pointing at a file is a server fact, not a client one.
   */
  const uploadAvatar = async (file: File) => {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const url = await sendAvatar(body)

      if (!(await saveProfile(url))) void discardAvatar(url)
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
    saveProfile: () => void saveProfile(),
    savingProfile,
    uploadAvatar,
    uploading,
    passwordForm,
    changePassword,
    logout,
  }
}
