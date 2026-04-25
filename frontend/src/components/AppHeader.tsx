import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

type Props = {
  title: string
  subtitle?: string
}

export default function AppHeader({ title, subtitle = 'Productivity' }: Props) {
  const { logout } = useAuth()
  const nav = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-800 text-slate-100'
        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
    }`

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/70 bg-slate-950/55 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="text-sm text-slate-400">{subtitle}</div>
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex gap-1" aria-label="Main">
            <NavLink to="/tasks" className={linkClass} end>
              Tasks
            </NavLink>
            <NavLink to="/analytics" className={linkClass}>
              Analytics
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={() => {
              logout()
              nav('/auth', { replace: true })
            }}
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm hover:bg-slate-800/70"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
