import { Text } from 'react-native'

interface KickerProps {
  children: string
  className?: string
}

/** The small capitalised line that names a block. Same size and tracking as the
 * web's — it is the one piece of type the two apps would be most obviously
 * different on if it drifted. */
export function Kicker({ children, className = '' }: KickerProps) {
  return (
    <Text className={`text-[9.5px] uppercase tracking-[1.5px] text-neutral-600 ${className}`}>
      {children}
    </Text>
  )
}
