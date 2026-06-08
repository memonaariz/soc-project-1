import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Clock, ArrowRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'

const STATUS_COLORS = {
  OPEN: 'text-soc-orange border-orange-800 bg-orange-900/20',
  IN_PROGRESS: 'text-soc-accent border-soc-accent/40 bg-soc-accent/10',
  CLOSED: 'text-soc-green border-green-800 bg-green-900/20',
}

export default function Cases() {
  const [cases, setCases] = useState([])
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/cases').then(r => setCases(r.data)).catch(() => toast.error('Failed to load cases.'))
  }, [])

  const deleteCase = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this case?')) return
    await api.delete(`/cases/${id}`)
    setCases(c => c.filter(x => x.id !== id))
    toast.success('Case deleted.')
  }

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.severity === filter || c.status === filter)

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-soc-muted mb-1">
          <span className="text-soc-green">▶</span> SOC COPILOT / CASE MANAGER
        </div>
        <h1 className="text-xl font-bold text-white font-mono">Case Manager</h1>
        <p className="text-soc-muted text-sm mt-1">Track and manage all your security investigation cases.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'CRITICAL', 'HIGH'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
              filter === f
                ? 'bg-soc-accent/10 border-soc-accent/40 text-soc-accent'
                : 'border-soc-border text-soc-muted hover:text-soc-text hover:border-soc-border/80'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-soc-muted">{filtered.length} case(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-soc-card border border-soc-border rounded-xl p-16 text-center">
          <FolderOpen className="w-10 h-10 text-soc-muted/30 mx-auto mb-3" />
          <p className="text-soc-muted font-mono text-sm">No cases found.</p>
          <Link to="/triage" className="text-soc-accent text-xs font-mono hover:underline mt-2 inline-block">
            → Triage an alert to create a case
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link
              key={c.id}
              to={`/cases/${c.id}`}
              className="flex items-center gap-4 bg-soc-card border border-soc-border hover:border-soc-accent/30 rounded-xl px-5 py-4 transition-all group"
            >
              <SeverityBadge severity={c.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-soc-text font-medium truncate">{c.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {c.mitre_techniques?.slice(0, 3).map(t => (
                    <span key={t.id} className="text-[10px] font-mono text-soc-accent/70">{t.id}</span>
                  ))}
                </div>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${STATUS_COLORS[c.status] || 'text-soc-muted border-soc-border'}`}>
                {c.status}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-soc-muted font-mono">
                <Clock className="w-3 h-3" />
                {new Date(c.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={(e) => deleteCase(c.id, e)}
                className="p-1.5 rounded hover:bg-red-900/30 hover:text-red-400 text-soc-muted/40 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ArrowRight className="w-4 h-4 text-soc-muted group-hover:text-soc-accent transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
