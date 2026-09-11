'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { CaretLeftIcon } from '@/data/icons'
import { useRegister } from './hooks/use-register'

/**
 * Signing up is the whole gate: there is no approval queue and no e-mail to
 * confirm. `register` opens the session itself (see the shared AuthProvider),
 * so the person lands on their month instead of being sent back here to type
 * the same password again.
 */
export default function RegisterPage() {
  const { form, submit, submitting } = useRegister()

  return (
    <>
      <div className="flex-none px-6 pt-6">
        <Link href="/login" aria-label="Voltar" className="inline-flex text-neutral-500">
          <CaretLeftIcon size={20} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-6">
        <h1 className="text-[24px] font-medium tracking-[-0.02em]">Criar conta</h1>
        <p className="mt-2 max-w-[260px] text-[12.5px] leading-relaxed text-neutral-500">
          Leva um minuto. Depois é só cadastrar sua renda fixa e os gastos do mês.
        </p>

        <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
          <Field
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
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
              // Checked here and not in the domain: the domain only ever
              // receives one password, so "they match" is a rule of this form,
              // not of the User entity.
              validate: (value) =>
                value === form.getValues('password') || 'As senhas não conferem.',
            })}
            error={form.formState.errors.confirmPassword?.message}
          />

          <Button type="submit" className="mt-4 w-full" disabled={submitting}>
            {submitting ? 'Criando…' : 'Criar conta'}
          </Button>
        </form>
      </div>

      <p className="flex-none px-6 pb-[max(env(safe-area-inset-bottom),34px)] text-center text-[12.5px] text-neutral-600">
        Já tem conta?{' '}
        <Link href="/login" className="text-accent-300 hover:underline">
          Entrar
        </Link>
      </p>
    </>
  )
}
