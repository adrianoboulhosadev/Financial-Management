'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { GOOGLE_LOGIN_ENABLED } from '@/lib/features'
import { useLogin } from './hooks/use-login'

/**
 * The door. A full screen rather than a card floating in the middle of one:
 * this is an app, and its first screen is a screen.
 *
 * The body is vertically centred and the footer is pinned to the bottom, so the
 * "criar agora" line stays where a thumb can reach it no matter how tall the
 * phone is.
 */
export default function LoginPage() {
  const { form, submit, submitting } = useLogin()

  return (
    <>
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10">
        <h1 className="text-[26px] font-medium tracking-[-0.02em]">Login</h1>
        <p className="mt-2 max-w-[250px] text-[12.5px] leading-relaxed text-neutral-500">
          Entre para ver o mês, os tetos e o que ainda falta pagar.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
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

          <Button type="submit" className="mt-4 w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {GOOGLE_LOGIN_ENABLED && (
          <div className="mt-3">
            <GoogleSignInButton />
          </div>
        )}
      </div>

      <p className="flex-none px-6 pb-[max(env(safe-area-inset-bottom),34px)] text-center text-[12.5px] text-neutral-600">
        Não tem conta?{' '}
        <Link href="/register" className="text-accent-300 hover:underline">
          Criar agora
        </Link>
      </p>
    </>
  )
}
