'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { useRegister } from './hooks/use-register'

export default function RegisterPage() {
  const { form, submit, submitting } = useRegister()

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-ink-text-soft">
        O acesso é liberado por um administrador depois do cadastro.
      </p>

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
          autoComplete="new-password"
          placeholder="8+ caracteres, maiúscula, número e símbolo"
          {...form.register('password', { required: 'Informe a senha.' })}
          error={form.formState.errors.password?.message}
        />
        <Field
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          {...form.register('confirmPassword', {
            required: 'Confirme a senha.',
            // Checked here and not in the domain: the domain only ever receives
            // one password, so "they match" is a rule of this form, not of the
            // User entity.
            validate: (value) => value === form.getValues('password') || 'As senhas não conferem.',
          })}
          error={form.formState.errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Criando…' : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-text-soft">
        Já tem conta?{' '}
        <Link href="/login" className="hover:underline">
          Entrar
        </Link>
      </p>
    </>
  )
}
