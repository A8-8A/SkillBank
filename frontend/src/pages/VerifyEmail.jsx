import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    client.get(`/auth/verify?token=${token}`)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified!')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.error || err.response?.data?.message || 'Verification failed. The link may be invalid or already used.')
      })
  }, [token])

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
        <div className="auth-form-inner" style={{ textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <h1>Verifying…</h1>
              <p style={{ marginTop: '1rem' }}>Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1>Email Verified ✓</h1>
              <p style={{ fontSize: '1.1rem', marginTop: '1rem' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1>Verification Failed</h1>
              <p style={{ fontSize: '1.1rem', marginTop: '1rem', color: '#c0392b' }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
                Go to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
