import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import type { LoginUserInput } from '@auth/adapters'
import { Errors } from 'shared'
import { errorCode, errorMessage, useAuth } from 'ui'
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
      // A legitimate account still waiting at the gate gets its own screen — an
      // error toast would suggest they did something wrong.
      if (errorCode(error) === Errors.ACCOUNT_PENDING_APPROVAL) {
        router.replace('/pending')
        return
      }
      notify.error(errorMessage(error, 'Não foi possível entrar.'))
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submit, submitting }
}
