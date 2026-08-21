'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import type { LoginUserInput } from '@auth/adapters'
import { Errors } from 'shared'
import { useAuth } from 'client'
import { useGoogleOAuthBridge } from '@/hooks/use-google-oauth-bridge'
import { errorMessage } from 'client'
import { notify } from '@/lib/notify'

export function useLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<LoginUserInput>({ defaultValues: { email: '', password: '' } })

  // Google lands on the SAME session as email+password (see the bridge).
  // Memoized because the bridge's effect depends on it — a fresh function on
  // every render would re-run the exchange.
  useGoogleOAuthBridge(useCallback(() => router.replace('/dashboard'), [router]))

  const submit = form.handleSubmit(async (input) => {
    setSubmitting(true)
    try {
      await login(input)
      router.replace('/dashboard')
    } catch (error) {
      // A legitimate account still waiting at the gate gets its own screen —
      // an error toast would suggest they did something wrong.
      if (isPendingApproval(error)) {
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

function isPendingApproval(error: unknown): boolean {
  const body = (error as { response?: { data?: { errors?: Array<{ code: string }> } } })?.response
    ?.data
  return body?.errors?.[0]?.code === Errors.ACCOUNT_PENDING_APPROVAL
}
