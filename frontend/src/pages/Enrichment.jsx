import { useState } from 'react'
import { Search, ExternalLink, AlertCircle, CheckCircle, HelpCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const VERDICT_CONFIG = {
  MALICIOUS: { color: 'text-soc-red', bg: 'bg-red-900/20 border-red-800', icon: AlertCircle },
  SUSPICIOUS: { color: 'text-soc-orange', bg: 'bg-orange-900/20 border-orange-800', icon: AlertCircle },
  CLEAN: { color: 'text-soc-green', bg: 'bg-green-900/20 border-green-800', icon: CheckCircle },
  UNKNOWN: { color: 'text-soc-muted', bg: 'bg-soc-card border-soc-border', icon: HelpCircle },
  NOT_FOUND: { color: 'text-soc-muted', bg: 'bg-soc-card border-soc-border', icon: HelpCircle },
}

const IOC_EXAMPLES = [
  { label: 'Malicious IP', value: '185.220.101.45', type: 'ipv4' },
  { label: 'Hash (SHA256)', value: 'a5c8e3d9f1b2047e6c8d3f5a1e9b7c4d2f0e8a6c3b5d7f9e1a3c5b7d9f0e2a4c6', type: 'sha256' },
  { label: 'Domain', value: 'malware-c2-domain.tk', type: 'domain' },
]

export default function Enrichment() {
  const [ioc, setIoc] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const enrich = async (iocValue = ioc) => {
    if (!iocValue.trim()) return toast.error('Enter an IOC.')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/enrich', { ioc: iocValue.trim() })
      setResult(data)
      setHistory(h => [data, ...h].slice(0, 10))
    } catch {
      toast.error('Enrichment failed.')
    } finally {
      setLoading(false)
    }
  }

  const VerdictIcon = result ? (VERDICT_CONFIG[result.verdict]?.icon || HelpCircle) : null

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-soc-muted mb-1">
          <span className="text-soc-green">▶</span> SOC COPILOT / IOC ENRICHMENT
        </div>
        <h1 className="text-xl font-bold text-white font-mono">IOC Enrichment</h1>
        <p className="text-soc-muted text-sm mt-1">Enrich IPs, domains, file hashes, and URLs against VirusTotal, AbuseIPDB, and Shodan.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Input + Result */}
        <div className="col-span-2 space-y-4">
          {/* Search bar */}
          <div className="bg-soc-card border border-soc-border rounded-xl p-5">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">IOC Lookup</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={ioc}
                onChange={e => setIoc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enrich()}
                placeholder="IP address, domain, MD5/SHA256, URL..."
                className="flex-1 bg-soc-surface border border-soc-border rounded-lg px-4 py-2.5 text-sm font-mono text-soc-text placeholder-soc-muted/50 focus:outline-none focus:border-soc-accent/50"
              />
              <button
                onClick={() => enrich()}
                disabled={loading || !ioc.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-soc-accent/10 border border-soc-accent/40 text-soc-accent font-mono text-sm rounded-lg hover:bg-soc-accent/20 transition-all disabled:opacity-40"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Looking up...' : 'Enrich'}
              </button>
            </div>

            {/* Quick examples */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-mono text-soc-muted">Examples:</span>
              {IOC_EXAMPLES.map(ex => (
                <button
                  key={ex.value}
                  onClick={() => { setIoc(ex.value); enrich(ex.value) }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-soc-border text-soc-muted hover:text-soc-text hover:border-soc-accent/30 transition-all"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {loading && (
            <div className="bg-soc-card border border-soc-border rounded-xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-soc-accent/30 border-t-soc-accent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-soc-accent font-mono text-sm">QUERYING THREAT INTELLIGENCE...</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-soc-card border border-soc-border rounded-xl overflow-hidden">
              {/* Verdict header */}
              <div className={`px-5 py-4 border-b border-soc-border flex items-center justify-between ${VERDICT_CONFIG[result.verdict]?.bg || ''}`}>
                <div className="flex items-center gap-3">
                  {VerdictIcon && <VerdictIcon className={`w-5 h-5 ${VERDICT_CONFIG[result.verdict]?.color}`} />}
                  <div>
                    <div className={`text-sm font-mono font-bold ${VERDICT_CONFIG[result.verdict]?.color}`}>{result.verdict}</div>
                    <div className="text-xs font-mono text-soc-muted">{result.ioc} <span className="text-soc-accent/60">({result.ioc_type})</span></div>
                  </div>
                </div>
              </div>

              {/* Source results */}
              <div className="p-5 space-y-3">
                {result.sources?.map((src, i) => (
                  <div key={i} className="bg-soc-surface border border-soc-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-soc-text">{src.source}</span>
                      {src.verdict && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${VERDICT_CONFIG[src.verdict]?.bg} ${VERDICT_CONFIG[src.verdict]?.color}`}>
                          {src.verdict}
                        </span>
                      )}
                    </div>

                    {src.status ? (
                      <p className="text-xs font-mono text-soc-muted">{src.status}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-mono">
                        {src.malicious_detections !== undefined && (
                          <><span className="text-soc-muted">Malicious Detections</span><span className={src.malicious_detections > 0 ? 'text-soc-red' : 'text-soc-green'}>{src.malicious_detections} / {src.total_engines}</span></>
                        )}
                        {src.abuse_confidence_score !== undefined && (
                          <><span className="text-soc-muted">Abuse Score</span><span className={src.abuse_confidence_score >= 25 ? 'text-soc-red' : 'text-soc-green'}>{src.abuse_confidence_score}%</span></>
                        )}
                        {src.total_reports !== undefined && (
                          <><span className="text-soc-muted">Total Reports</span><span className="text-soc-text">{src.total_reports}</span></>
                        )}
                        {src.country && (
                          <><span className="text-soc-muted">Country</span><span className="text-soc-text">{src.country}</span></>
                        )}
                        {src.isp && (
                          <><span className="text-soc-muted">ISP</span><span className="text-soc-text">{src.isp}</span></>
                        )}
                        {src.org && (
                          <><span className="text-soc-muted">Organization</span><span className="text-soc-text">{src.org}</span></>
                        )}
                        {src.open_ports?.length > 0 && (
                          <><span className="text-soc-muted">Open Ports</span><span className="text-soc-text">{src.open_ports.join(', ')}</span></>
                        )}
                        {src.vulns?.length > 0 && (
                          <><span className="text-soc-muted">CVEs</span><span className="text-soc-red">{src.vulns.join(', ')}</span></>
                        )}
                      </div>
                    )}

                    {src.link && (
                      <a href={src.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-mono text-soc-accent hover:underline mt-3">
                        View on {src.source} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div>
          <div className="bg-soc-card border border-soc-border rounded-xl p-4">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Lookup History</p>
            {history.length === 0 ? (
              <p className="text-xs font-mono text-soc-muted/50">No lookups yet.</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => { setIoc(h.ioc); setResult(h) }}
                    className="w-full text-left p-2.5 rounded-lg border border-soc-border hover:border-soc-accent/30 hover:bg-soc-surface transition-all"
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-mono font-bold ${VERDICT_CONFIG[h.verdict]?.color}`}>{h.verdict}</span>
                      <span className="text-[9px] font-mono text-soc-muted/60">{h.ioc_type}</span>
                    </div>
                    <p className="text-[11px] font-mono text-soc-text truncate">{h.ioc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tips card */}
          <div className="mt-4 bg-soc-card border border-soc-border rounded-xl p-4">
            <p className="text-xs font-mono text-soc-muted uppercase tracking-wider mb-3">Supported IOC Types</p>
            <div className="space-y-1.5 text-xs font-mono text-soc-muted">
              {[
                ['IPv4', 'e.g. 1.2.3.4'],
                ['Domain', 'e.g. evil.com'],
                ['MD5', '32 char hex'],
                ['SHA1', '40 char hex'],
                ['SHA256', '64 char hex'],
                ['URL', 'https://...'],
              ].map(([type, hint]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-soc-text">{type}</span>
                  <span className="text-soc-muted/60">{hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
