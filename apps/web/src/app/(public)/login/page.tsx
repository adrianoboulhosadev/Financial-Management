'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { GOOGLE_LOGIN_ENABLED } from '@/lib/features'
import { useLogin } from './hooks/use-login'

export default function LoginPage() {
  const { form, submit, submitting } = useLogin()

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Financial</h1>
      <p className="mt-1 text-sm text-ink-text-soft">Entre para ver o mês.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          {...form.register('email', { required: 'Informe o e-mail.' })}
          error={form.formState.errors.email?.message}
        />
        <Field
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...form.register('password', { required: 'Informe a senha.' })}
          error={form.formState.errors.password?.message}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      {GOOGLE_LOGIN_ENABLED && (
        <div className="mt-4">
          <GoogleSignInButton />
        </div>
      )}

      <p className="mt-6 text-center text-sm text-ink-text-soft">
        Não tem conta?{' '}
        <Link href="/register" className="hover:underline">
          Criar conta
        </Link>
      </p>
    </>
  )
}
