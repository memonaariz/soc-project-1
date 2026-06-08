import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, FolderOpen, ShieldCheck, Activity, ArrowRight, Clock } from 'lucide-react'
import api from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'

function StatCard({ icon: Icon, label, value, color, glow }) {
  return (
    <div className={`bg-soc-card border border-soc-border rounded-xl p-5 ${glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-soc-muted uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold font-mono mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${color}`} style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const username = localStorage.getItem('username') || 'analyst'

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-soc-muted mb-1">
          <span className="text-soc-green">▶</span> SOC COPILOT / DASHBOARD
        </div>
        <h1 className="text-2xl font-bold text-white font-mono">
          Welcome back, <span className="text-soc-accent">{username}</span>
        </h1>
        <p className="text-soc-muted text-sm mt-1">Your analyst workbench — triage alerts, manage cases, enrich IOCs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderOpen} label="Total Cases" value={stats?.total_cases ?? '—'} color="text-soc-accent" glow="glow-accent" />
        <StatCard icon={AlertTriangle} label="Open Cases" value={stats?.open_cases ?? '—'} color="text-soc-orange" />
        <StatCard icon={Activity} label="Critical" value={stats?.critical_cases ?? '—'} color="text-soc-red" glow="glow-red" />
        <StatCard icon={ShieldCheck} label="Closed" value={stats?.closed_cases ?? '—'} color="text-soc-green" glow="glow-green" />
      </div>

      {/* Quick Actions + Recent Cases */}
      <div className="grid grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-soc-card border border-soc-border rounded-xl p-5">
          <h2 className="text-sm font-mono font-semibold text-soc-text mb-4 uppercase tracking-wider">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/triage', label: 'Triage New Alert', desc: 'Analyze & score incoming alert', icon: AlertTriangle, color: 'text-soc-red' },
              { to: '/cases', label: 'View All Cases', desc: 'Open case manager', icon: FolderOpen, color: 'text-soc-accent' },
              { to: '/enrichment', label: 'Enrich IOC', desc: 'Lookup IP, hash, domain', icon: Activity, color: 'text-soc-green' },
            ].map(({ to, label, desc, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg border border-soc-border hover:border-soc-accent/30 hover:bg-soc-surface transition-all group"
              >
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-soc-text font-medium">{label}</div>
                  <div className="text-xs text-soc-muted">{desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-soc-muted group-hover:text-soc-accent transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent cases */}
        <div className="col-span-2 bg-soc-card border border-soc-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-semibold text-soc-text uppercase tracking-wider">Recent Cases</h2>
            <Link to="/cases" className="text-xs font-mono text-soc-accent hover:underline">View all →</Link>
          </div>
          {stats?.recent_cases?.length ? (
            <div className="space-y-2">
              {stats.recent_cases.map(c => (
                <Link
                  key={c.id}
                  to={`/cases/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-soc-border hover:border-soc-accent/30 hover:bg-soc-surface transition-all"
                >
                  <SeverityBadge severity={c.severity} />
                  <span className="flex-1 text-sm font-mono text-soc-text truncate">{c.title}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${c.status === 'OPEN' ? 'text-soc-orange border-orange-800 bg-orange-900/20' : 'text-soc-green border-green-800 bg-green-900/20'}`}>
                    {c.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-soc-muted font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-soc-muted">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-mono">No cases yet. Triage your first alert.</p>
            </div>
          )}
        </div>
      </div>

      {/* MITRE reference banner */}
      <div className="mt-6 p-4 rounded-xl border border-soc-accent/20 bg-soc-accent/5 flex items-center gap-3">
        <div className="text-soc-accent font-mono text-xs font-bold px-2 py-1 bg-soc-accent/10 rounded border border-soc-accent/20">MITRE ATT&CK®</div>
        <p className="text-sm text-soc-muted">
          SOC Copilot automatically maps alerts to MITRE ATT&CK techniques and generates guided investigation playbooks.
        </p>
        <a href="https://attack.mitre.org" target="_blank" rel="noreferrer" className="ml-auto text-xs font-mono text-soc-accent hover:underline shrink-0">
          View Framework →
        </a>
      </div>
    </div>
  )
}
