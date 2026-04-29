import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'

export default function Register() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '', city: '', bio: '', phoneNumber: '',
    referralCode: searchParams.get('ref') || ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const set = field => e => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/auth/register', form)
      setRegistered(true)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-panel-image">
          <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80" alt="Community learning together" />
          <div className="auth-panel-overlay">
            <div className="auth-panel-brand">SkillBank</div>
            <div className="auth-panel-tagline">
              <h2>Your skills<br />have value.</h2>
              <p>Join a community that trades knowledge — no money, just time.</p>
            </div>
          </div>
        </div>
        <div className="auth-panel-form">
          <div className="auth-form-inner" style={{ textAlign: 'center' }}>
            <h1>Check your email</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '1rem' }}>
              We've sent a verification link to <strong>{form.email}</strong>.
            </p>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>
              Click the link in the email to activate your account, then come back here to sign in.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-panel-image">
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80" alt="Community learning together" />
        <div className="auth-panel-overlay">
          <div className="auth-panel-brand">SkillBank</div>
          <div className="auth-panel-tagline">
            <h2>Your skills<br />have value.</h2>
            <p>Join a community that trades knowledge — no money, just time.</p>
          </div>
        </div>
      </div>

      <div className="auth-panel-form">
        <div className="auth-form-inner">
          <h1>Create account</h1>
          <p className="auth-subtitle">You'll start with 1 free credit{form.referralCode ? ' + 1 referral bonus' : ''}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Ada Lovelace" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required minLength={8} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" value={form.city} onChange={set('city')} placeholder="Beirut" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+961 ..." />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={form.bio} onChange={set('bio')} rows={2} placeholder="Tell others what you're passionate about..." />
            </div>
            <div className="form-group">
              <label>Referral Code (optional)</label>
              <input type="text" value={form.referralCode} onChange={set('referralCode')} placeholder="e.g. ALI-A3F2C8" />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '.25rem' }}>
              {loading ? 'Creating account...' : 'Get Started →'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
