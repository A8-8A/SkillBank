import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || ''
      if (msg === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await client.post('/auth/resend-verification', { email: form.email })
      setResent(true)
    } catch {
      setError('Failed to resend verification email')
    } finally {
      setResending(false)
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

          {needsVerification && (
            <div className="alert alert-error" style={{ textAlign: 'center' }}>
              <p><strong>Email not verified.</strong></p>
              <p style={{ marginTop: '0.5rem' }}>Check your inbox for the verification link.</p>
              {resent ? (
                <p style={{ marginTop: '0.5rem', color: '#2d6a4f' }}>✓ Verification email resent!</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    marginTop: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#2d6a4f',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

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
            <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2d6a4f' }}>
                Forgot password?
              </Link>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
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
