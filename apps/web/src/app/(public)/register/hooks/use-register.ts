'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import type { RegisterUserInput } from '@auth/adapters'

import { useAuth, errorMessage } from 'ui'
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
      // `register` also opens the session (see the shared AuthProvider), so the
      // person goes straight to their month instead of back to the login form.
      await registerUser({ email, password })
      router.replace('/dashboard')
    } catch (error) {
      notify.error(errorMessage(error, 'Não foi possível criar a conta.'))
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submit, submitting }
}
