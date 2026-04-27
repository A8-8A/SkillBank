import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await client.post('/auth/reset-password', { token, password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-panel-form" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div className="auth-form-inner" style={{ textAlign: 'center' }}>
            <h1>Invalid Link</h1>
            <p style={{ marginTop: '1rem' }}>This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Request a New Link
            </Link>
          </div>
        </div>
      </div>
    )
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
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <h1>Password Reset ✓</h1>
              <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
                Your password has been updated successfully.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1>Set new password</h1>
              <p className="auth-subtitle">Enter your new password below</p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}
                  style={{ marginTop: '.5rem' }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
