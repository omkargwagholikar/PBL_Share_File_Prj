import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, UploadCloud, Search, LayoutDashboard, GraduationCap, UserCog } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/cn'

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-brand-600/20 text-brand-200 ring-1 ring-brand-500/30'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#0b1020] text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0a0f1e] p-5 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-brand-400" />
          <span className="bg-gradient-to-r from-brand-300 to-purple-300 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
            EduNexus
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/search" icon={Search} label="Search" />
          <NavItem to="/upload" icon={UploadCloud} label="Upload" />
          <NavItem to="/profile" icon={UserCog} label="Profile" />
        </nav>
        <div className="mt-auto rounded-xl border border-white/5 bg-white/5 p-3">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="truncate text-sm font-medium text-slate-100">
            {user?.display_name ?? user?.email ?? 'student'}
          </div>
          <button
            onClick={handleSignOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 md:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-brand-400" />
            <span className="text-lg font-semibold">EduNexus</span>
          </div>
          <button onClick={handleSignOut} className="text-slate-300">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
