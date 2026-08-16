import Link from 'next/link'

/**
 * Where a legitimate sign-up waits. It exists because a pending account is NOT
 * an error: the person did everything right and just needs to be let in, so
 * they get a screen that says so instead of a red toast.
 */
export default function PendingPage() {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-warning">Aguardando liberação</p>
      <h1 className="mb-1.5 mt-2 text-2xl font-semibold tracking-tight">Conta criada</h1>
      <p className="text-sm leading-relaxed text-ink-text-soft">
        Seu cadastro foi registrado e está esperando a aprovação do administrador. Assim que ele
        liberar, você entra normalmente com o mesmo e-mail e senha.
      </p>

      <p className="mt-8 text-center text-sm text-ink-text-soft">
        <Link href="/login" className="hover:underline">
          Voltar para o login
        </Link>
      </p>
    </>
  )
}
