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
   * Exactly one of the two files is left over afterwards, and it gets dropped:
   * the OLD photo once the new one is stored (nothing points at it any more,
   * and before this it stayed on disk for the life of the volume), or the NEW
   * one if the save failed, since the profile still names the old.
   */
  const uploadAvatar = async (file: File) => {
    const previous = user?.avatarUrl ?? null
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const url = await sendAvatar(body)

      if (await saveProfile(url)) {
        if (previous && previous !== url) void discardAvatar(previous)
      } else {
        void discardAvatar(url)
      }
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
