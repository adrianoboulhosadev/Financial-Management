import { Link } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

/**
 * Where a legitimate sign-up waits. It exists because a pending account is NOT
 * an error: the person did everything right and just needs to be let in, so
 * they get a screen that says so instead of a red toast.
 */
export default function PendingScreen() {
  return (
    <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
      <View className="gap-2 rounded-card border border-ink-border bg-ink-surface p-6">
        <Text className="text-xs font-medium uppercase tracking-wide text-warning">
          Aguardando liberação
        </Text>
        <Text className="text-2xl font-semibold text-ink-text">Conta criada</Text>
        <Text className="text-sm leading-relaxed text-ink-text-soft">
          Seu cadastro foi registrado e está esperando a aprovação do administrador. Assim que ele
          liberar, você entra normalmente com o mesmo e-mail e senha.
        </Text>

        <Link href="/login" className="mt-4 text-center text-sm text-accent">
          Voltar para o login
        </Link>
      </View>
    </ScrollView>
  )
}
