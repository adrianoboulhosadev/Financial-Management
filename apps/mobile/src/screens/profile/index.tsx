import { Controller } from 'react-hook-form'
import { Image, Pressable, Text, View } from 'react-native'
import { mediaUrl, SEMANTIC } from 'ui'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Loading } from '@/components/loading'
import { Pane } from '@/components/pane'
import { Screen } from '@/components/screen'
import { ScreenHeader } from '@/components/screen-header'
import { LogoutIcon } from '@/data/icons'
import { useProfileScreen } from './hooks/use-profile-screen'

/**
 * The account. The e-mail is shown but never editable — it is the identity the
 * session is issued against, and changing it is a different operation from
 * editing a display name.
 *
 * The nickname and the avatar are display-only: neither ever authenticates
 * anything, which is why they can be changed here with nothing more than a
 * logged-in session.
 */
export function ProfileScreen() {
  const screen = useProfileScreen()

  if (!screen.user) return <Loading />

  const initials = (screen.user.nickname || screen.user.email).slice(0, 2).toUpperCase()

  return (
    <Screen header={<ScreenHeader title="Perfil" back />}>
      <View className="gap-4 px-5 pt-2">
        <View className="items-center gap-2.5 pb-1 pt-2.5">
          <View className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-accent-900">
            {screen.user.avatarUrl ? (
              <Image source={{ uri: mediaUrl(screen.user.avatarUrl) }} className="h-full w-full" />
            ) : (
              <Text className="text-[25px] font-medium text-accent-200">{initials}</Text>
            )}
          </View>

          <Text className="text-[15px] font-medium text-ink-text">
            {screen.user.nickname || screen.user.email.split('@')[0]}
          </Text>
        </View>

        <View>
          <Kicker className="pb-1.5">Dados</Kicker>
          <Pane className="px-4">
            <ListRow>
              <Text className="flex-1 text-[13px] text-ink-text">E-mail</Text>
              <Text numberOfLines={1} className="text-[12.5px] text-neutral-500">
                {screen.user.email}
              </Text>
            </ListRow>
            <ListRow last>
              <View className="w-full">
                <Field
                  label="Apelido"
                  placeholder="Como você quer ser chamado"
                  value={screen.nickname}
                  onChangeText={screen.setNickname}
                />
                <View className="mt-3">
                  <Button
                    label={screen.saving ? 'Salvando…' : 'Salvar'}
                    onPress={screen.saveProfile}
                    disabled={screen.saving}
                  />
                </View>
              </View>
            </ListRow>
          </Pane>
        </View>

        <View>
          <Kicker className="pb-1.5">Segurança</Kicker>
          <Pane className="gap-4 px-4 py-4">
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
          </Pane>
        </View>

        <Pane>
          <Pressable
            onPress={() => screen.logout()}
            className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
          >
            <LogoutIcon color={SEMANTIC.negative} size={18} />
            <Text className="flex-1 text-[13px] text-negative">Sair da conta</Text>
          </Pressable>
        </Pane>
      </View>
    </Screen>
  )
}
