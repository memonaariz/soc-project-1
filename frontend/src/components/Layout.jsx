import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Shield, LayoutDashboard, AlertTriangle, FolderOpen, Search, LogOut, Activity } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'analyst'

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/triage', icon: AlertTriangle, label: 'Alert Triage' },
    { to: '/cases', icon: FolderOpen, label: 'Case Manager' },
    { to: '/enrichment', icon: Search, label: 'IOC Enrichment' },
  ]

  return (
    <div className="flex h-screen bg-soc-bg grid-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-soc-surface border-r border-soc-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-soc-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-soc-accent/10 border border-soc-accent/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-soc-accent" />
            </div>
            <div>
              <div className="font-bold text-white font-mono text-sm tracking-wider">SOC COPILOT</div>
              <div className="text-[10px] text-soc-muted font-mono">ANALYST WORKBENCH v1.0</div>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="px-5 py-3 border-b border-soc-border">
          <div className="flex items-center gap-2">
            <div className="relative flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-soc-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-soc-green"></span>
            </div>
            <span className="text-[11px] font-mono text-soc-muted">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-soc-accent/10 text-soc-accent border border-soc-accent/20'
                    : 'text-soc-muted hover:text-soc-text hover:bg-soc-card'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-soc-border pt-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-soc-card border border-soc-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-soc-accent2/20 border border-soc-accent2/40 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-soc-accent2" />
              </div>
              <div>
                <div className="text-xs font-mono text-soc-text font-medium">{username}</div>
                <div className="text-[10px] text-soc-muted">SOC Analyst</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-red-900/30 hover:text-red-400 text-soc-muted transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
