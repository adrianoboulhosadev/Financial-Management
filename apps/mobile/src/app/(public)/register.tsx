import { Controller } from 'react-hook-form'
import { Link } from 'expo-router'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { useRegister } from './hooks/use-register'

export default function RegisterScreen() {
  const { form, submit, submitting } = useRegister()

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="gap-4 rounded-card border border-ink-border bg-ink-surface p-6">
          <View>
            <Text className="text-2xl font-semibold text-ink-text">Criar conta</Text>
            <Text className="mt-1 text-sm text-ink-text-soft">
              Leva um minuto e você já entra direto na sua visão do mês.
            </Text>
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
                placeholder="8+ caracteres, maiúscula, número e símbolo"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.password?.message}
              />
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            rules={{
              required: 'Confirme a senha.',
              // Checked here and not in the domain: the domain only ever
              // receives one password, so "they match" is a rule of this form.
              validate: (value) =>
                value === form.getValues('password') || 'As senhas não conferem.',
            }}
            render={({ field }) => (
              <Field
                label="Confirmar senha"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            label={submitting ? 'Criando…' : 'Criar conta'}
            onPress={submit}
            disabled={submitting}
          />

          <Link href="/login" className="text-center text-sm text-accent">
            Já tem conta? Entrar
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
