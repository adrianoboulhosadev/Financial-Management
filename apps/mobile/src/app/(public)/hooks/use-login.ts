import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import type { LoginUserInput } from '@auth/adapters'
import { errorMessage, useAuth } from 'ui'
import { notify } from '@/lib/notify'

export function useLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<LoginUserInput>({ defaultValues: { email: '', password: '' } })

  const submit = form.handleSubmit(async (input) => {
    setSubmitting(true)
    try {
      await login(input)
      router.replace('/dashboard')
    } catch (error) {
      notify.error(errorMessage(error, 'Não foi possível entrar.'))
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submit, submitting }
}
