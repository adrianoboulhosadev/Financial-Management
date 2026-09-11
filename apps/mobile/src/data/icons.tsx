import Svg, { Path } from 'react-native-svg'
import type { ColorValue } from 'react-native'

/**
 * The product's icon set on the phone — the SAME Phosphor path data as
 * `apps/web/src/data/icons.tsx`, rendered through react-native-svg.
 *
 * The colour arrives as a PROP and not through a class: React Native has no CSS
 * inheritance, so there is no `currentColor` for a glyph to pick up from the row
 * around it. That is the only difference between this file and the web's.
 */
export interface IconProps {
  color?: ColorValue
  size?: number
}

const DASHBOARD_D = [
  'M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z',
]

export const DashboardIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {DASHBOARD_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const DASHBOARDFILLED_D = [
  'M120,56v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40h48A16,16,0,0,1,120,56Zm80-16H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-96,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96,0H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z',
]

export const DashboardFilledIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {DASHBOARDFILLED_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const TRANSACTIONS_D = [
  'M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z',
]

export const TransactionsIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {TRANSACTIONS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const TRANSACTIONSFILLED_D = [
  'M42.34,85.66a8,8,0,0,1,0-11.32l32-32A8,8,0,0,1,88,48V72H208a8,8,0,0,1,0,16H88v24a8,8,0,0,1-13.66,5.66Zm171.32,84.68-32-32A8,8,0,0,0,168,144v24H48a8,8,0,0,0,0,16H168v24a8,8,0,0,0,13.66,5.66l32-32A8,8,0,0,0,213.66,170.34Z',
]

export const TransactionsFilledIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {TRANSACTIONSFILLED_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const NOTIFICATIONS_D = [
  'M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z',
]

export const NotificationsIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {NOTIFICATIONS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const NOTIFICATIONSFILLED_D = [
  'M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z',
]

export const NotificationsFilledIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {NOTIFICATIONSFILLED_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const INCOME_D = [
  'M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,132Z',
]

export const IncomeIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {INCOME_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const INCOMEFILLED_D = [
  'M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-36,80a12,12,0,1,1,12-12A12,12,0,0,1,180,144Z',
]

export const IncomeFilledIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {INCOMEFILLED_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const MORE_D = [
  'M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z',
]

export const MoreIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {MORE_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const MOREFILLED_D = [
  'M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM192,184H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm0-48H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Z',
]

export const MoreFilledIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {MOREFILLED_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CHECKLIST_D = [
  'M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM208,208V48H48V208H208Z',
]

export const ChecklistIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CHECKLIST_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const RECURRENCES_D = [
  'M24,128A72.08,72.08,0,0,1,96,56H204.69L194.34,45.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L204.69,72H96a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8,8,0,0,0-8,8,56.06,56.06,0,0,1-56,56H51.31l10.35-10.34a8,8,0,0,0-11.32-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L51.31,200H160a72.08,72.08,0,0,0,72-72A8,8,0,0,0,224,120Z',
]

export const RecurrencesIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {RECURRENCES_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const INVESTMENTS_D = [
  'M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z',
]

export const InvestmentsIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {INVESTMENTS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const BANKS_D = [
  'M24,104H48v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16H208V104h24a8,8,0,0,0,4.19-14.81l-104-64a8,8,0,0,0-8.38,0l-104,64A8,8,0,0,0,24,104Zm40,0H96v64H64Zm80,0v64H112V104Zm48,64H160V104h32ZM128,41.39,203.74,88H52.26ZM248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z',
]

export const BanksIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {BANKS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const BUDGETS_D = [
  'M100,116.43a8,8,0,0,0,4-6.93v-72A8,8,0,0,0,93.34,30,104.06,104.06,0,0,0,25.73,147a8,8,0,0,0,4.52,5.81,7.86,7.86,0,0,0,3.35.74,8,8,0,0,0,4-1.07ZM88,49.62v55.26L40.12,132.51C40,131,40,129.48,40,128A88.12,88.12,0,0,1,88,49.62ZM128,24a8,8,0,0,0-8,8v91.82L41.19,169.73a8,8,0,0,0-2.87,11A104,104,0,1,0,128,24Zm0,192a88.47,88.47,0,0,1-71.49-36.68l75.52-44a8,8,0,0,0,4-6.92V40.36A88,88,0,0,1,128,216Z',
]

export const BudgetsIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {BUDGETS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CATEGORIES_D = [
  'M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z',
]

export const CategoriesIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CATEGORIES_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const PROFILE_D = [
  'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z',
]

export const ProfileIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {PROFILE_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CARETLEFT_D = [
  'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
]

export const CaretLeftIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CARETLEFT_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CARETRIGHT_D = [
  'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
]

export const CaretRightIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CARETRIGHT_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const PLUS_D = [
  'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
]

export const PlusIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {PLUS_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const SEARCH_D = [
  'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
]

export const SearchIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {SEARCH_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const ARROWIN_D = [
  'M197.66,69.66,83.31,184H168a8,8,0,0,1,0,16H64a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v84.69L186.34,58.34a8,8,0,0,1,11.32,11.32Z',
]

export const ArrowInIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {ARROWIN_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const ARROWOUT_D = [
  'M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z',
]

export const ArrowOutIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {ARROWOUT_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const WARNING_D = [
  'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z',
]

export const WarningIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {WARNING_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const ENVELOPE_D = [
  'M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z',
]

export const EnvelopeIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {ENVELOPE_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const ENVELOPEOPEN_D = [
  'M228.44,89.34l-96-64a8,8,0,0,0-8.88,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.44,89.34ZM96.72,152,40,192V111.53Zm16.37,8h29.82l56.63,40H56.46Zm46.19-8L216,111.53V192ZM128,41.61l81.91,54.61-67,47.78H113.11l-67-47.78Z',
]

export const EnvelopeOpenIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {ENVELOPEOPEN_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const TRASH_D = [
  'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z',
]

export const TrashIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {TRASH_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const LOGOUT_D = [
  'M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z',
]

export const LogoutIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {LOGOUT_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const EYE_D = [
  'M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z',
]

export const EyeIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {EYE_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const EYESLASH_D = [
  'M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z',
]

export const EyeSlashIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {EYESLASH_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const PENCIL_D = [
  'M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z',
]

export const PencilIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {PENCIL_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CLOSE_D = [
  'M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z',
]

export const CloseIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CLOSE_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CARD_D = [
  'M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z',
]

export const CardIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CARD_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CALENDARCHECK_D = [
  'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-38.34-85.66a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L116,164.69l42.34-42.35A8,8,0,0,1,169.66,122.34Z',
]

export const CalendarCheckIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CALENDARCHECK_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const GEAR_D = [
  'M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z',
]

export const GearIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {GEAR_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)

const CHECK_D = [
  'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM205.66,85.66l-96,96a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L104,164.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z',
]

export const CheckIcon = ({ color = '#e9e9ed', size = 20 }: IconProps) => (
  <Svg viewBox="0 0 256 256" width={size} height={size}>
    {CHECK_D.map((d) => (
      <Path key={d} d={d} fill={color} />
    ))}
  </Svg>
)
