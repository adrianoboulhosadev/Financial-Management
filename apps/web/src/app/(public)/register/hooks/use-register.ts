'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import type { RegisterUserInput } from '@auth/adapters'
import { useAuth } from '@/contexts/auth-context'
import { errorMessage } from '@/lib/api/errors'
import { notify } from '@/lib/notify'

interface RegisterForm extends RegisterUserInput {
  confirmPassword: string
}

export function useRegister() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<RegisterForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const submit = form.handleSubmit(async ({ email, password }) => {
    setSubmitting(true)
    try {
      await registerUser({ email, password })
      // Signing up does NOT sign anyone in: the account waits for an admin.
      router.replace('/pending')
    } catch (error) {
      notify.error(errorMessage(error, 'Não foi possível criar a conta.'))
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submit, submitting }
}
