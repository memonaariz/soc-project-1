import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, ExternalLink, BookOpen, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'

function PhaseBadge({ phase }) {
  const cls = {
    DETECT: 'phase-detect', INVESTIGATE: 'phase-investigate',
    CONTAIN: 'phase-contain', ERADICATE: 'phase-eradicate',
    RECOVER: 'phase-recover', 'POST-INCIDENT': 'phase-post-incident',
  }[phase] || 'phase-detect'
  return <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cls} shrink-0`}>{phase}</span>
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    api.get(`/cases/${id}`).then(r => {
      setCaseData(r.data)
      setNotes(r.data.notes || '')
      setStatus(r.data.status || 'OPEN')
    }).catch(() => toast.error('Case not found.'))
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch(`/cases/${id}`, { notes, status })
      setCaseData(data)
      toast.success('Case updated.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (!caseData) return (
    <div className="p-8 flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-soc-accent/30 border-t-soc-accent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/cases')} className="flex items-center gap-1.5 text-xs font-mono text-soc-muted hover:text-soc-text mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SeverityBadge severity={caseData.severity} />
              <span className="text-xs font-mono text-soc-muted">CASE #{String(caseData.id).padStart(4, '0')}</span>
            </div>
            <h1 className="text-xl font-bold text-white font-mono">{caseData.title}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-soc-card border border-soc-border text-soc-text text-xs font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-soc-accent/50"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-mono px-4 py-2 rounded-lg bg-soc-green/10 border border-soc-green/30 text-soc-green hover:bg-soc-green/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-soc-border mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'mitre', label: `MITRE (${caseData.mitre_techniques?.length || 0})` },
          { id: 'playbook', label: 'Playbook' },
          { id: 'raw', label: 'Raw Alert' },
          { id: 'notes', label: 'Notes' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-xs font-mono transition-all ${
              tab === t.id
                ? 'text-soc-accent border-b-2 border-soc-accent'
                : 'text-soc-muted hover:text-soc-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-soc-card border border-soc-border rounded-xl p-5">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Triage Summary</p>
            <pre className="text-xs font-mono text-soc-text whitespace-pre-wrap leading-5">{caseData.triage_summary}</pre>
          </div>
          <div className="bg-soc-card border border-soc-border rounded-xl p-5">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Case Info</p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span className="text-soc-muted">Created</span><span className="text-soc-text">{new Date(caseData.created_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">Updated</span><span className="text-soc-text">{new Date(caseData.updated_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">Status</span><span className="text-soc-text">{status}</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">MITRE Techniques</span><span className="text-soc-text">{caseData.mitre_techniques?.length || 0}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* MITRE */}
      {tab === 'mitre' && (
        <div className="space-y-2">
          {caseData.mitre_techniques?.map(t => (
            <div key={t.id} className="p-4 bg-soc-card border border-soc-border rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-soc-accent text-sm">{t.id}</span>
                  <span className="font-mono font-semibold text-soc-text text-sm">{t.name}</span>
                </div>
                <a href={t.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 text-soc-muted hover:text-soc-accent" />
                </a>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-accent2/10 border border-soc-accent2/30 text-soc-accent2">{t.tactic}</span>
              <p className="text-xs text-soc-muted mt-2">{t.description}</p>
            </div>
          ))}
          {caseData.mitre_techniques?.length === 0 && <p className="text-soc-muted font-mono text-sm">No techniques mapped.</p>}
        </div>
      )}

      {/* Playbook */}
      {tab === 'playbook' && caseData.playbook && (
        <div>
          <h3 className="text-sm font-mono font-bold text-soc-text mb-4">{caseData.playbook.title}</h3>
          {caseData.playbook.tools?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {caseData.playbook.tools.map(t => (
                <span key={t} className="text-xs font-mono px-2 py-1 rounded bg-soc-card border border-soc-border text-soc-muted">{t}</span>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {caseData.playbook.steps?.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 bg-soc-card border border-soc-border rounded-xl">
                <span className="text-[10px] font-mono text-soc-muted shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <PhaseBadge phase={step.phase} />
                <p className="text-xs font-mono text-soc-text leading-5">{step.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Alert */}
      {tab === 'raw' && (
        <div className="bg-soc-card border border-soc-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-soc-border bg-soc-surface">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
            </div>
            <span className="text-xs font-mono text-soc-muted">raw_alert.log</span>
          </div>
          <pre className="p-5 text-xs font-mono text-soc-green whitespace-pre-wrap leading-5 overflow-auto max-h-[500px]">{caseData.raw_alert}</pre>
        </div>
      )}

      {/* Notes */}
      {tab === 'notes' && (
        <div>
          <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Investigation Notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={16}
            placeholder="Document your investigation findings here...&#10;&#10;• IOCs analyzed&#10;• Affected systems&#10;• Actions taken&#10;• Timeline&#10;• Recommendations"
            className="w-full bg-soc-card border border-soc-border rounded-xl p-4 text-sm font-mono text-soc-text placeholder-soc-muted/40 focus:outline-none focus:border-soc-accent/40 resize-none"
          />
        </div>
      )}
    </div>
  )
}
