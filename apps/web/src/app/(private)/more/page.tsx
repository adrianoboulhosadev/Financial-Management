'use client'

import Link from 'next/link'
import { mediaUrl } from 'ui'
import { Amount } from '@/components/amount'
import { IconBadge } from '@/components/icon-badge'
import { Kicker } from '@/components/kicker'
import { ListRow } from '@/components/list-row'
import { Pane } from '@/components/pane'
import { ScreenHeader } from '@/components/screen-header'
import { CaretRightIcon, LogoutIcon } from '@/data/icons'
import { useMore } from './hooks/use-more'

/**
 * Everything the five tabs could not hold, grouped by when it is used, with the
 * account at the top and the way out at the bottom.
 *
 * Each row carries its own number — four bills open, fourteen categories, what
 * the portfolio is worth — so the menu answers "is there anything to do in
 * there?" without being opened.
 */
export default function MorePage() {
  const { groups, user, displayName, initials, logout, badges } = useMore()

  return (
    <>
      <ScreenHeader title="Menu" />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
        <Link href="/profile">
          <Pane className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-full bg-accent-900 text-[15px] font-medium text-accent-200">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(user.avatarUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px]">{displayName}</span>
              <span className="mt-0.5 block truncate text-[11px] text-neutral-600">
                {user?.email}
              </span>
            </span>
            <CaretRightIcon size={15} className="text-neutral-600" />
          </Pane>
        </Link>

        {groups.map((group) => (
          <section key={group.title}>
            <Kicker className="pb-1.5">{group.title}</Kicker>
            <Pane className="px-4">
              {group.items.map((item, index) => {
                const badge = badges[item.href]

                return (
                  <Link key={item.href} href={item.href} className="block">
                    <ListRow last={index === group.items.length - 1}>
                      <IconBadge>
                        <item.icon size={17} />
                      </IconBadge>
                      <span className="min-w-0 flex-1 truncate text-[13px]">{item.label}</span>
                      {typeof badge === 'number' ? (
                        <Amount cents={badge} className="text-[11.5px] text-neutral-600" />
                      ) : (
                        badge && <span className="text-[11.5px] text-warning">{badge}</span>
                      )}
                      <CaretRightIcon size={14} className="text-neutral-700" />
                    </ListRow>
                  </Link>
                )
              })}
            </Pane>
          </section>
        ))}

        <Pane>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <LogoutIcon size={18} className="text-negative" />
            <span className="flex-1 text-[13px] text-negative">Sair da conta</span>
          </button>
        </Pane>
      </div>
    </>
  )
}
