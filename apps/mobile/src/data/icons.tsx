import type { ColorValue } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

/**
 * The SAME glyphs as the web's, sharing the exact path data — that is what
 * makes a screen recognisable as the same product on both. Only the host
 * elements differ (`react-native-svg` instead of the DOM's `<svg>`), which is
 * precisely the boundary a shared component could not cross.
 *
 * `color` rather than `currentColor`: React Native has no CSS inheritance, so
 * the caller passes the colour the tab bar/sidebar already decided.
 */
export interface IconProps {
  // ColorValue, not string: this is what React Navigation hands a tabBarIcon.
  color?: ColorValue
  size?: number
}

const stroke = (color: ColorValue = '#a9b8c9', size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const DashboardIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Rect x="3" y="3" width="7" height="9" rx="1.5" />
    <Rect x="14" y="3" width="7" height="5" rx="1.5" />
    <Rect x="14" y="10" width="7" height="11" rx="1.5" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Svg>
)

export const TransactionsIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Path d="M4 7h13l-3-3" />
    <Path d="M20 17H7l3 3" />
  </Svg>
)

export const CategoriesIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Path d="M4 4v14a2 2 0 0 0 2 2h3" />
    <Path d="M4 10h6" />
    <Rect x="12" y="7" width="8" height="5" rx="1.5" />
    <Rect x="12" y="16" width="8" height="5" rx="1.5" />
  </Svg>
)

export const BudgetsIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 3.5v8.5h8.5" />
  </Svg>
)

export const IncomeIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Rect x="3" y="6" width="18" height="12" rx="2" />
    <Circle cx="12" cy="12" r="2.5" />
  </Svg>
)

export const RecurrencesIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
    <Path d="M20 4v4h-4" />
    <Path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
    <Path d="M4 20v-4h4" />
  </Svg>
)

export const NotificationsIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
    <Path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
)

export const ProfileIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Circle cx="12" cy="8" r="3.5" />
    <Path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
  </Svg>
)

export const LogoutIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <Path d="M10 8 6 12l4 4" />
    <Path d="M6 12h10" />
  </Svg>
)

export const MoreIcon = ({ color, size }: IconProps) => (
  <Svg {...stroke(color, size)}>
    <Circle cx="5" cy="12" r="1.4" />
    <Circle cx="12" cy="12" r="1.4" />
    <Circle cx="19" cy="12" r="1.4" />
  </Svg>
)
