/**
 * One 20x20 stroked glyph per destination. Inline SVG rather than an icon
 * package: nine icons do not justify a dependency, and these inherit
 * `currentColor` so the active/inactive states need no extra wiring.
 */
type IconProps = { className?: string }

const base = (className = '') => ({
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: `shrink-0 ${className}`,
})

export const DashboardIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="10" width="7" height="11" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

export const TransactionsIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h13l-3-3" />
    <path d="M20 17H7l3 3" />
  </svg>
)

export const CategoriesIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 4v14a2 2 0 0 0 2 2h3" />
    <path d="M4 10h6" />
    <rect x="12" y="7" width="8" height="5" rx="1.5" />
    <rect x="12" y="16" width="8" height="5" rx="1.5" />
  </svg>
)

export const BudgetsIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v8.5h8.5" />
  </svg>
)

export const IncomeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
)

export const RecurrencesIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
    <path d="M4 20v-4h4" />
  </svg>
)

export const NotificationsIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
)

export const AdminIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const ProfileIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
  </svg>
)

export const LogoutIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 8 6 12l4 4" />
    <path d="M6 12h10" />
  </svg>
)
