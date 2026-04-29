import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

function calcCompletion(profile, skills, slots) {
  let score = 0, total = 6
  if (profile?.name) score++
  if (profile?.bio) score++
  if (profile?.city) score++
  if (profile?.phoneNumber) score++
  if (skills?.length > 0) score++
  if (slots?.length > 0) score++
  return Math.round((score / total) * 100)
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [skills, setSkills] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // First get profile, then use profile.id for other calls
    client.get('/users/me')
      .then(profileRes => {
        setProfile(profileRes.data)
        const uid = profileRes.data.id
        return Promise.all([
          client.get('/sessions').catch(() => ({ data: [] })),
          client.get(`/skills/user/${uid}`).catch(() => ({ data: [] })),
          client.get(`/availability/${uid}`).catch(() => ({ data: [] })),
        ])
      })
      .then(([sessionsRes, skillsRes, slotsRes]) => {
        setSessions(sessionsRes.data.slice(0, 5))
        setSkills(skillsRes.data)
        setSlots(slotsRes.data)
      })
      .catch(err => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false))
  }, [])

  const copyReferral = () => {
    if (profile?.referralCode) {
      const url = `${window.location.origin}/register?ref=${profile.referralCode}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="loading" />

  const pending  = sessions.filter(s => s.status === 'PENDING').length
  const upcoming = sessions.filter(s => s.status === 'CONFIRMED').length
  const completion = calcCompletion(profile, skills, slots)

  return (
    <div className="page">
      <div className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80" alt="Community workshop" />
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-content">
          <div>
            <p className="hero-greeting">Good to see you</p>
            <h1 className="hero-name">{profile?.name || user?.name}</h1>
          </div>
          <div className="hero-balance-display">
            <span className="hero-balance-number">{profile?.balance ?? '—'}</span>
            <span className="hero-balance-label">credits available</span>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      {completion < 100 && (
        <div className="card completion-card">
          <div className="completion-header">
            <h3>Complete your profile</h3>
            <span className="completion-pct">{completion}%</span>
          </div>
          <div className="completion-bar-bg">
            <div className="completion-bar-fill" style={{ width: `${completion}%` }} />
          </div>
          <div className="completion-hints">
            {!profile?.bio && <Link to="/profile" className="completion-hint">Add a bio</Link>}
            {!profile?.city && <Link to="/profile" className="completion-hint">Set your city</Link>}
            {!profile?.phoneNumber && <Link to="/profile" className="completion-hint">Add phone number</Link>}
            {skills.length === 0 && <Link to="/skills" className="completion-hint">List your skills</Link>}
            {slots.length === 0 && <Link to="/profile" className="completion-hint">Set your availability</Link>}
          </div>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Based in</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', marginTop: '.2rem' }}>{profile?.city || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Awaiting confirm</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming sessions</div>
          <div className="stat-value">{upcoming}</div>
        </div>
      </div>

      <div className="promo-row">
        <Link to="/wallet" className="promo-banner promo-buy">
          <div className="promo-text">
            <h3>Need more credits?</h3>
            <p>Get 5 credits for just <strong>$60</strong> — 4 + 1 free</p>
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

      {/* Referral */}
      {profile?.referralCode && (
        <div className="card referral-card">
          <div className="referral-inner">
            <div>
              <h3>Invite friends, earn credits</h3>
              <p className="muted">Share your referral link — you both get 1 free credit when they sign up.</p>
            </div>
            <div className="referral-code-box">
              <span className="referral-code">{profile.referralCode}</span>
              <button className="btn btn-primary btn-sm" onClick={copyReferral}>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <thead><tr><th>Skill</th><th>With</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {sessions.map(s => {
                  const isTeacher = s.teacher?.id === profile?.id
                  const other = isTeacher ? s.learner : s.teacher
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.skill?.name}</strong></td>
                      <td>{other?.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                        {new Date(s.scheduledAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
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
