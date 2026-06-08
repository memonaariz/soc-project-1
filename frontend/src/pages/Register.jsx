import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Account created. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-soc-bg grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-soc-accent2/10 border border-soc-accent2/30 mb-4">
            <Shield className="w-8 h-8 text-soc-accent2" />
          </div>
          <h1 className="text-2xl font-bold text-white font-mono tracking-wider">CREATE ACCOUNT</h1>
          <p className="text-soc-muted text-sm font-mono mt-1">REGISTER NEW ANALYST</p>
        </div>

        <form onSubmit={submit} className="bg-soc-card border border-soc-border rounded-xl p-6 space-y-4">
          {[
            { field: 'username', label: 'Username', type: 'text', placeholder: 'analyst_name' },
            { field: 'email', label: 'Email', type: 'email', placeholder: 'analyst@soc.local' },
            { field: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-mono text-soc-muted mb-1.5 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                required
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-soc-surface border border-soc-border rounded-lg px-3 py-2.5 text-sm font-mono text-soc-text focus:outline-none focus:border-soc-accent2/50 focus:ring-1 focus:ring-soc-accent2/20"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-soc-accent2/10 hover:bg-soc-accent2/20 border border-soc-accent2/40 text-soc-accent2 font-mono text-sm font-medium py-2.5 rounded-lg transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'CREATING...' : 'CREATE ANALYST ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-soc-muted text-xs font-mono mt-4">
          Have an account?{' '}
          <Link to="/login" className="text-soc-accent hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
