import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { useLogin } from './hooks/use-login'

export default function LoginScreen() {
  const { form, submit, submitting } = useLogin()

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="gap-4 rounded-card border border-ink-border bg-ink-surface p-6">
          <View>
            <Text className="text-2xl font-semibold text-ink-text">Financial</Text>
            <Text className="mt-1 text-sm text-ink-text-soft">Entre para ver o mês.</Text>
          </View>

          <Controller
            control={form.control}
            name="email"
            rules={{ required: 'Informe o e-mail.' }}
            render={({ field }) => (
              <Field
                label="E-mail"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="voce@exemplo.com"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.email?.message}
              />
            )}
          />

          <Controller
            control={form.control}
            name="password"
            rules={{ required: 'Informe a senha.' }}
            render={({ field }) => (
              <Field
                label="Senha"
                secureTextEntry
                placeholder="••••••••"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.password?.message}
              />
            )}
          />

          <Button label={submitting ? 'Entrando…' : 'Entrar'} onPress={submit} disabled={submitting} />

          <Link href="/register" className="text-center text-sm text-accent">
            Não tem conta? Criar conta
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
