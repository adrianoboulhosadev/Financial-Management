import { Pressable, Text, type PressableProps } from 'react-native'
import {
  BUTTON_LABEL_CLASSES,
  BUTTON_VARIANT_CLASSES,
  type ButtonVariant,
} from './data/button-variants'

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string
  variant?: ButtonVariant
  className?: string
}

export function Button({
  label,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 active:opacity-80 ${
        BUTTON_VARIANT_CLASSES[variant]
      } ${disabled ? 'opacity-50' : ''} ${className}`}
      {...props}
    >
      <Text className={`text-sm font-medium ${BUTTON_LABEL_CLASSES[variant]}`}>{label}</Text>
    </Pressable>
  )
}
