import { Controller } from 'react-hook-form'
import { Text, View } from 'react-native'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Loading } from '@/components/loading'
import { Screen } from '@/components/screen'
import { useProfileScreen } from './hooks/use-profile-screen'

export function ProfileScreen() {
  const screen = useProfileScreen()

  if (!screen.user) return <Loading />

  return (
    <Screen>
      <View className="gap-4 rounded-card border border-ink-border bg-ink-surface p-4">
        <Text className="text-sm font-semibold text-ink-text">Perfil</Text>

        <Field label="E-mail" value={screen.user.email} editable={false} />
        <Field
          label="Apelido"
          placeholder="Como você quer ser chamado"
          value={screen.nickname}
          onChangeText={screen.setNickname}
        />

        <Button
          label={screen.saving ? 'Salvando…' : 'Salvar'}
          onPress={screen.saveProfile}
          disabled={screen.saving}
        />
      </View>

      <View className="gap-4 rounded-card border border-ink-border bg-ink-surface p-4">
        <Text className="text-sm font-semibold text-ink-text">Alterar senha</Text>

        <Controller
          control={screen.passwordForm.control}
          name="oldPassword"
          rules={{ required: 'Informe a senha atual.' }}
          render={({ field }) => (
            <Field
              label="Senha atual"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={screen.passwordForm.formState.errors.oldPassword?.message}
            />
          )}
        />

        <Controller
          control={screen.passwordForm.control}
          name="newPassword"
          rules={{ required: 'Informe a nova senha.' }}
          render={({ field }) => (
            <Field
              label="Nova senha"
              secureTextEntry
              placeholder="8+ caracteres, maiúscula, número e símbolo"
              value={field.value}
              onChangeText={field.onChange}
              error={screen.passwordForm.formState.errors.newPassword?.message}
            />
          )}
        />

        <Button label="Alterar senha" onPress={screen.changePassword} />
      </View>
    </Screen>
  )
}
