import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <h1>Check your email ✉️</h1>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '1rem' }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              </p>
              <p style={{ marginTop: '0.5rem', color: '#666' }}>
                The link expires in 1 hour.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1>Forgot password?</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}
                  style={{ marginTop: '.5rem' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="auth-footer">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
