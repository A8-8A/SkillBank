import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/users/me'),
      client.get('/sessions')
    ]).then(([profileRes, sessionsRes]) => {
      setProfile(profileRes.data)
      setSessions(sessionsRes.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading" />

  const pending  = sessions.filter(s => s.status === 'PENDING').length
  const upcoming = sessions.filter(s => s.status === 'CONFIRMED').length

  return (
    <div className="page">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
            alt="Community workshop"
          />
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-content">
          <div>
            <p className="hero-greeting">Good to see you</p>
            <h1 className="hero-name">{user?.name}</h1>
          </div>
          <div className="hero-balance-display">
            <span className="hero-balance-number">{profile?.balance ?? '—'}</span>
            <span className="hero-balance-label">credits available</span>
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card" style={{ animationDelay: '.05s' }}>
          <div className="stat-label">Based in</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', marginTop: '.2rem' }}>
            {profile?.city || '—'}
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: '.1s' }}>
          <div className="stat-label">Awaiting confirm</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: '.15s' }}>
          <div className="stat-label">Upcoming sessions</div>
          <div className="stat-value">{upcoming}</div>
        </div>
      </div>

      {/* ── Promo Banners ────────────────────────────────────────────────── */}
      <div className="promo-row">
        <Link to="/wallet" className="promo-banner promo-buy">
          <div className="promo-text">
            <h3>Need more credits?</h3>
            <p>Get 5 credits for just <strong>$80</strong> — save $20</p>
          </div>
          <span className="promo-cta">Buy Now</span>
        </Link>

        <Link to="/wallet?tab=redeem" className="promo-banner promo-redeem">
          <div className="promo-text">
            <h3>Cash out your skills</h3>
            <p>Redeem <strong>5 credits for $50</strong> — start earning</p>
          </div>
          <span className="promo-cta">Redeem</span>
        </Link>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-row">
          <Link to="/skills" className="action-card">
            <div className="action-icon">✦</div>
            <span>Add a Skill</span>
          </Link>
          <Link to="/matches" className="action-card">
            <div className="action-icon">↔</div>
            <span>Find Matches</span>
          </Link>
          <Link to="/profile" className="action-card">
            <div className="action-icon">◎</div>
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* ── Recent Sessions ──────────────────────────────────────────────── */}
      <div>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2>Recent Sessions</h2>
          <Link to="/sessions" className="btn btn-sm">View all →</Link>
        </div>

        {sessions.length === 0 ? (
          <div className="card empty-state" style={{ padding: '3rem' }}>
            <p>No sessions yet — find someone to learn from.</p>
            <Link to="/matches" className="btn btn-primary">Browse Matches</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>With</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const other = s.teacher?.id === user?.userId ? s.learner : s.teacher
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.skill?.name}</strong></td>
                      <td>{other?.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                        {new Date(s.scheduledAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td>
                        <span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
