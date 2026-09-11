import { Controller } from 'react-hook-form'
import { Link, router } from 'expo-router'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { NEUTRAL } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { CaretLeftIcon } from '@/data/icons'
import { useRegister } from './hooks/use-register'

/**
 * Signing up is the whole gate: there is no approval queue and no e-mail to
 * confirm. `register` opens the session itself (see the shared AuthProvider),
 * so the person lands on their month instead of being sent back to type the
 * same password again.
 */
export default function RegisterScreen() {
  const { form, submit, submitting } = useRegister()

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="px-6 pt-4">
        <Pressable onPress={() => router.back()} accessibilityLabel="Voltar" hitSlop={10}>
          <CaretLeftIcon color={NEUTRAL[500]} size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-6">
        <Text className="text-[24px] font-medium tracking-tight text-ink-text">Criar conta</Text>
        <Text className="mt-2 max-w-[260px] text-[12.5px] leading-relaxed text-neutral-500">
          Leva um minuto. Depois é só cadastrar sua renda fixa e os gastos do mês.
        </Text>

        <View className="mt-7 gap-3">
          <Controller
            control={form.control}
            name="email"
            rules={{ required: 'Informe o e-mail.' }}
            render={({ field }) => (
              <Field
                label="E-mail"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="seu@email.com"
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
        </View>

        <View className="mt-4">
          <Button
            label={submitting ? 'Criando…' : 'Criar conta'}
            onPress={submit}
            disabled={submitting}
          />
        </View>
      </ScrollView>

      <Text className="px-6 pb-9 text-center text-[12.5px] text-neutral-600">
        Já tem conta?{' '}
        <Link href="/login" className="text-accent-300">
          Entrar
        </Link>
      </Text>
    </KeyboardAvoidingView>
  )
}
