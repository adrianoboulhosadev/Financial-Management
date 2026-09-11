import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { useLogin } from './hooks/use-login'

/**
 * The door. A full screen rather than a card floating in the middle of one —
 * the same composition the web now uses, with the body vertically centred and
 * the "criar agora" line pinned at the bottom where a thumb can reach it.
 */
export default function LoginScreen() {
  const { form, submit, submitting } = useLogin()

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <Text className="text-[26px] font-medium tracking-tight text-ink-text">Login</Text>
        <Text className="mt-2 max-w-[250px] text-[12.5px] leading-relaxed text-neutral-500">
          Entre para ver o mês, os tetos e o que ainda falta pagar.
        </Text>

        <View className="mt-8 gap-3">
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
        </View>

        <View className="mt-4">
          <Button
            label={submitting ? 'Entrando…' : 'Entrar'}
            onPress={submit}
            disabled={submitting}
          />
        </View>
      </ScrollView>

      <Text className="px-6 pb-9 text-center text-[12.5px] text-neutral-600">
        Não tem conta?{' '}
        <Link href="/register" className="text-accent-300">
          Criar agora
        </Link>
      </Text>
    </KeyboardAvoidingView>
  )
}
