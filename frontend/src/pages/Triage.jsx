import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Zap, Save, ExternalLink, BookOpen, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import SeverityBadge from '../components/SeverityBadge'

const SAMPLE_ALERTS = [
  {
    label: 'Cobalt Strike Beacon',
    text: `[EDR Alert] Suspicious network connection detected\nProcess: rundll32.exe (PID: 4821)\nParent: winword.exe\nDestination: 185.220.101.45:443\nBeacon interval: ~60s (consistent C2 pattern)\nCobalt Strike malleable profile detected in HTTP headers\nHost: WORKSTATION-042 | User: john.doe`,
  },
  {
    label: 'LSASS Credential Dump',
    text: `[Windows Security Event 4656]\nObject: \\Device\\HarddiskVolume3\\Windows\\System32\\lsass.exe\nAccess Requested: READ_CONTROL, PROCESS_VM_READ\nProcess: procdump64.exe\nProcess ID: 0x1A3C\nSubject: DOMAIN\\svc_backup\nHost: DC01.corp.local\nTime: 2024-01-15 03:42:17 UTC`,
  },
  {
    label: 'Ransomware - LockBit',
    text: `[File System Alert] Mass file encryption detected\nEncrypted files count: 2,847 in last 60 seconds\nFile extensions changed to: .lockbit\nRansom note dropped: !!-Restore-My-Files-!!.txt\nProcess: svchost32.exe (non-standard)\nShadow copies deleted: vssadmin.exe delete shadows /all\nHost: FILESERVER-01 | Time: 2024-01-15 02:17:33`,
  },
  {
    label: 'SSH Brute Force',
    text: `[Firewall/IDS Alert] Multiple failed SSH login attempts\nSource IP: 45.33.32.156\nTarget: 10.0.1.50:22\nFailed attempts: 847 in 5 minutes\nAttempted usernames: root, admin, ubuntu, deploy\nAlert: Possible password brute force / credential stuffing\nGeo: Romania | ASN: AS63023`,
  },
]

function PhaseBadge({ phase }) {
  const cls = {
    DETECT: 'phase-detect',
    INVESTIGATE: 'phase-investigate',
    CONTAIN: 'phase-contain',
    ERADICATE: 'phase-eradicate',
    RECOVER: 'phase-recover',
    'POST-INCIDENT': 'phase-post-incident',
  }[phase] || 'phase-detect'
  return <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cls} shrink-0`}>{phase}</span>
}

export default function Triage() {
  const [alertText, setAlertText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('summary')
  const navigate = useNavigate()

  const analyze = async () => {
    if (!alertText.trim()) return toast.error('Paste an alert first.')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/triage', { alert_text: alertText })
      setResult(data)
      toast.success('Triage complete.')
    } catch {
      toast.error('Triage failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const saveAsCase = async () => {
    if (!result) return
    setSaving(true)
    try {
      const title = `[${result.severity}] ${result.playbook?.title?.replace(' Playbook', '') || 'Alert'} — ${new Date().toLocaleDateString()}`
      const { data } = await api.post('/cases', { title, raw_alert: alertText })
      toast.success('Case created.')
      navigate(`/cases/${data.id}`)
    } catch {
      toast.error('Failed to create case.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-soc-muted mb-1">
          <span className="text-soc-green">▶</span> SOC COPILOT / ALERT TRIAGE
        </div>
        <h1 className="text-xl font-bold text-white font-mono">Alert Triage Engine</h1>
        <p className="text-soc-muted text-sm mt-1">Paste any raw alert or log. Get severity, MITRE mapping, and investigation playbook instantly.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          {/* Sample alerts */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-4">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Load Sample Alert</p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_ALERTS.map(s => (
                <button
                  key={s.label}
                  onClick={() => setAlertText(s.text)}
                  className="text-left text-xs font-mono px-2.5 py-2 rounded-lg border border-soc-border hover:border-soc-accent/40 hover:bg-soc-accent/5 text-soc-muted hover:text-soc-text transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alert input */}
          <div className="bg-soc-card border border-soc-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-soc-border bg-soc-surface">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
              </div>
              <span className="text-xs font-mono text-soc-muted ml-1">alert_input.log</span>
            </div>
            <textarea
              value={alertText}
              onChange={e => setAlertText(e.target.value)}
              rows={14}
              placeholder={`Paste raw alert here...\n\nSupports:\n• Windows Event Logs\n• Syslog / CEF format\n• EDR alerts\n• SIEM rules output\n• Firewall/IDS logs\n• Any free-text alert`}
              className="w-full bg-transparent p-4 text-sm font-mono text-soc-text placeholder-soc-muted/50 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading || !alertText.trim()}
            className="w-full bg-soc-accent/10 hover:bg-soc-accent/20 border border-soc-accent/40 hover:border-soc-accent text-soc-accent font-mono text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'ANALYZING THREAT...' : 'RUN TRIAGE'}
          </button>
        </div>

        {/* Results panel */}
        <div>
          {!result && !loading && (
            <div className="bg-soc-card border border-soc-border rounded-xl h-full flex items-center justify-center">
              <div className="text-center p-8">
                <AlertTriangle className="w-10 h-10 text-soc-muted/30 mx-auto mb-3" />
                <p className="text-soc-muted font-mono text-sm">Awaiting alert input...</p>
                <p className="text-soc-muted/50 font-mono text-xs mt-1">Paste an alert and run triage</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-soc-card border border-soc-border rounded-xl h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-soc-accent/30 border-t-soc-accent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-soc-accent font-mono text-sm">RUNNING TRIAGE ENGINE...</p>
                <p className="text-soc-muted font-mono text-xs mt-1">Mapping to MITRE ATT&CK...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-soc-card border border-soc-border rounded-xl overflow-hidden">
              {/* Result header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-soc-border bg-soc-surface">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={result.severity} />
                  <span className="text-xs font-mono text-soc-muted">Risk Score: <span className="text-soc-text">{result.risk_score}</span></span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveAsCase}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-soc-green/10 border border-soc-green/30 text-soc-green hover:bg-soc-green/20 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save as Case'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-soc-border">
                {[
                  { id: 'summary', label: 'Triage', icon: AlertTriangle },
                  { id: 'mitre', label: `MITRE (${result.mitre_techniques?.length || 0})`, icon: BookOpen },
                  { id: 'playbook', label: 'Playbook', icon: BookOpen },
                  ...(result.ai_explanation ? [{ id: 'ai', label: 'AI Analysis', icon: Brain }] : []),
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono transition-all ${
                      tab === t.id
                        ? 'text-soc-accent border-b-2 border-soc-accent bg-soc-accent/5'
                        : 'text-soc-muted hover:text-soc-text'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5 overflow-y-auto max-h-[520px]">
                {/* Summary tab */}
                {tab === 'summary' && (
                  <div className="space-y-4">
                    {/* IOCs */}
                    {Object.keys(result.iocs || {}).length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-2">Extracted IOCs</p>
                        <div className="space-y-1.5">
                          {Object.entries(result.iocs).map(([type, vals]) => (
                            <div key={type} className="flex items-start gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-accent2/10 border border-soc-accent2/30 text-soc-accent2 shrink-0 mt-0.5">{type.toUpperCase()}</span>
                              <span className="text-xs font-mono text-soc-text break-all">{vals.slice(0, 5).join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-2">Triage Summary</p>
                      <pre className="text-xs font-mono text-soc-text whitespace-pre-wrap bg-soc-surface border border-soc-border rounded-lg p-3 leading-5">{result.triage_summary}</pre>
                    </div>
                  </div>
                )}

                {/* MITRE tab */}
                {tab === 'mitre' && (
                  <div className="space-y-2">
                    {result.mitre_techniques?.length === 0 && (
                      <p className="text-soc-muted font-mono text-sm">No MITRE techniques matched. Try a more specific alert.</p>
                    )}
                    {result.mitre_techniques?.map(t => (
                      <div key={t.id} className="p-3 rounded-lg border border-soc-border bg-soc-surface hover:border-soc-accent/30 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-soc-accent">{t.id}</span>
                            <span className="text-xs font-mono font-semibold text-soc-text">{t.name}</span>
                          </div>
                          <a href={t.url} target="_blank" rel="noreferrer" className="shrink-0">
                            <ExternalLink className="w-3.5 h-3.5 text-soc-muted hover:text-soc-accent transition-colors" />
                          </a>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-accent2/10 border border-soc-accent2/30 text-soc-accent2">{t.tactic}</span>
                        <p className="text-xs text-soc-muted mt-2">{t.description}</p>
                        <p className="text-[10px] font-mono text-soc-muted/60 mt-1">Triggered by: "{t.matched_keyword}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Playbook tab */}
                {tab === 'playbook' && result.playbook && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-mono font-bold text-soc-text">{result.playbook.title}</h3>
                    </div>
                    {result.playbook.tools?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {result.playbook.tools.map(tool => (
                          <span key={tool} className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-card border border-soc-border text-soc-muted">{tool}</span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      {result.playbook.steps?.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-soc-surface border border-soc-border">
                          <span className="text-[10px] font-mono text-soc-muted shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                          <PhaseBadge phase={step.phase} />
                          <p className="text-xs font-mono text-soc-text leading-5">{step.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis tab */}
                {tab === 'ai' && result.ai_explanation && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-soc-accent2" />
                      <span className="text-xs font-mono text-soc-muted uppercase tracking-wider">AI-Powered Analysis</span>
                    </div>
                    <div className="bg-soc-surface border border-soc-accent2/20 rounded-lg p-4">
                      <p className="text-sm text-soc-text leading-6 whitespace-pre-wrap">{result.ai_explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
