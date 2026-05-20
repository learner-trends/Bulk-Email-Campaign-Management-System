import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/campaigns', label: 'Campaigns', icon: '◈' },
  { to: '/recipients', label: 'Recipients', icon: '◎' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.sub
    ? user.sub.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-surface border-b border-border backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <span className="text-accent text-sm font-display font-bold">✉</span>
        </div>
        <span className="font-display font-bold text-slate-100 tracking-tight hidden sm:block">
          Campaign<span className="text-accent">OS</span>
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map(({ to, label, icon }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-secondary hover:text-slate-200 hover:bg-hover'
                }
              `}
            >
              <span className="text-xs">{icon}</span>
              <span className="hidden sm:block">{label}</span>
            </Link>
          )
        })}
      </div>

      {/* User + Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">{initials}</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{user?.sub}</span>
            {isAdmin && (
              <span className="text-[10px] text-accent font-medium">Admin</span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-danger hover:bg-danger/10 border border-border hover:border-danger/30 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  )
}
