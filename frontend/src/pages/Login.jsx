import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel-image">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          alt="People collaborating"
        />
        <div className="auth-panel-overlay">
          <div className="auth-panel-brand">SkillBank ✦</div>
          <div className="auth-panel-tagline">
            <h2>Exchange skills.<br />Grow together.</h2>
            <p>Every hour you teach earns an hour to learn something new.</p>
          </div>
        </div>
      </div>

      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your journey</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ marginTop: '.5rem' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            No account yet? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
