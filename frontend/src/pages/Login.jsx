import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('username', form.username)
      params.append('password', form.password)
      const { data } = await api.post('/auth/login', params)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('username', data.username)
      toast.success('Access granted.')
      navigate('/dashboard')
    } catch {
      toast.error('Authentication failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soc-bg grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-soc-accent/10 border border-soc-accent/30 mb-4 glow-accent">
            <Shield className="w-8 h-8 text-soc-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white font-mono tracking-wider">SOC COPILOT</h1>
          <p className="text-soc-muted text-sm font-mono mt-1">ANALYST AUTHENTICATION REQUIRED</p>
        </div>

        <form onSubmit={submit} className="bg-soc-card border border-soc-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-soc-muted mb-1.5 uppercase tracking-wider">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-soc-surface border border-soc-border rounded-lg px-3 py-2.5 text-sm font-mono text-soc-text focus:outline-none focus:border-soc-accent/50 focus:ring-1 focus:ring-soc-accent/20"
              placeholder="analyst_username"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-soc-muted mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-soc-surface border border-soc-border rounded-lg px-3 py-2.5 text-sm font-mono text-soc-text focus:outline-none focus:border-soc-accent/50 focus:ring-1 focus:ring-soc-accent/20"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-soc-accent/10 hover:bg-soc-accent/20 border border-soc-accent/40 hover:border-soc-accent/60 text-soc-accent font-mono text-sm font-medium py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>

        <p className="text-center text-soc-muted text-xs font-mono mt-4">
          No account?{' '}
          <Link to="/register" className="text-soc-accent hover:underline">
            Register analyst
          </Link>
        </p>
      </div>
    </div>
  )
}
