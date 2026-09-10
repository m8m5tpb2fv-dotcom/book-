import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { HomeIcon, SearchIcon, LibraryIcon } from '../icons'
import { hapticSelection } from '../../lib/telegram'

const items = [
  { to: '/', label: 'Главная', icon: HomeIcon },
  { to: '/search', label: 'Поиск', icon: SearchIcon },
  { to: '/library', label: 'Моя музыка', icon: LibraryIcon },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur border-t border-line flex"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => hapticSelection()}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 h-14 text-[10px] font-semibold uppercase tracking-wide',
              isActive ? 'text-ink' : 'text-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} className={isActive ? 'text-ink' : 'text-muted'} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
