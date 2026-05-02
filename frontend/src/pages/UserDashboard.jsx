import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setValue(Math.round(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
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

  const displayBalance = useCountUp(profile?.balance ?? 0)

  if (loading) return <div className="loading" />

  const pending  = sessions.filter(s => s.status === 'PENDING').length
  const upcoming = sessions.filter(s => s.status === 'CONFIRMED').length
  const completion = calcCompletion(profile, skills, slots)

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80" alt="Community workshop" />
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <p className="hero-greeting">Good to see you</p>
            <h1 className="hero-name">{profile?.name || user?.name}</h1>
          </motion.div>
          <motion.div className="hero-balance-display" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <span className="hero-balance-number">{displayBalance}</span>
            <span className="hero-balance-label">credits available</span>
          </motion.div>
        </div>
      </div>

      {/* Profile Completion */}
      {completion < 100 && (
        <motion.div className="card completion-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="completion-header">
            <h3>Complete your profile</h3>
            <span className="completion-pct">{completion}%</span>
          </div>
          <div className="completion-bar-bg">
            <motion.div
              className="completion-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
          <div className="completion-hints">
            {!profile?.bio && <Link to="/profile" className="completion-hint">Add a bio</Link>}
            {!profile?.city && <Link to="/profile" className="completion-hint">Set your city</Link>}
            {!profile?.phoneNumber && <Link to="/profile" className="completion-hint">Add phone number</Link>}
            {skills.length === 0 && <Link to="/skills" className="completion-hint">List your skills</Link>}
            {slots.length === 0 && <Link to="/profile" className="completion-hint">Set your availability</Link>}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div className="stats-row" variants={stagger} initial="hidden" animate="show">
        <motion.div className="stat-card" variants={cardVariant}>
          <div className="stat-label">Based in</div>
          <div className="stat-value" style={{ fontSize: '1.1rem', marginTop: '.2rem' }}>{profile?.city || '—'}</div>
        </motion.div>
        <motion.div className="stat-card" variants={cardVariant}>
          <div className="stat-label">Awaiting confirm</div>
          <div className="stat-value">{pending}</div>
        </motion.div>
        <motion.div className="stat-card" variants={cardVariant}>
          <div className="stat-label">Upcoming sessions</div>
          <div className="stat-value">{upcoming}</div>
        </motion.div>
      </motion.div>

      {/* Promo */}
      <motion.div className="promo-row" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={cardVariant}>
          <Link to="/wallet" className="promo-banner promo-buy">
            <div className="promo-text">
              <h3>Need more credits?</h3>
              <p>Get 5 credits for just <strong>$60</strong> — 4 + 1 free</p>
            </div>
            <span className="promo-cta">Buy Now</span>
          </Link>
        </motion.div>
        <motion.div variants={cardVariant}>
          <Link to="/wallet?tab=redeem" className="promo-banner promo-redeem">
            <div className="promo-text">
              <h3>Cash out your skills</h3>
              <p>Redeem <strong>5 credits for $50</strong> — start earning</p>
            </div>
            <span className="promo-cta">Redeem</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Referral */}
      {profile?.referralCode && (
        <motion.div className="card referral-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <div className="referral-inner">
            <div>
              <h3>Invite friends, earn credits</h3>
              <p className="muted">Share your referral link — you both get 1 free credit when they sign up.</p>
            </div>
            <div className="referral-code-box">
              <span className="referral-code">{profile.referralCode}</span>
              <motion.button
                className="btn btn-primary btn-sm"
                onClick={copyReferral}
                whileTap={{ scale: 0.95 }}
                animate={copied ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2>Quick Actions</h2>
        </div>
        <motion.div className="actions-row" variants={stagger} initial="hidden" animate="show">
          {[
            { to: '/skills', icon: '✦', label: 'Add a Skill' },
            { to: '/matches', icon: '↔', label: 'Find Matches' },
            { to: '/profile', icon: '◎', label: 'My Profile' },
          ].map((a, i) => (
            <motion.div key={i} variants={cardVariant} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Link to={a.to} className="action-card">
                <div className="action-icon">{a.icon}</div>
                <span>{a.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2>Recent Sessions</h2>
          <Link to="/sessions" className="btn btn-sm">View all →</Link>
        </div>
        {sessions.length === 0 ? (
          <motion.div className="card empty-state" style={{ padding: '3rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p>No sessions yet — find someone to learn from.</p>
            <Link to="/matches" className="btn btn-primary">Browse Matches</Link>
          </motion.div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Skill</th><th>With</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {sessions.map((s, i) => {
                  const isTeacher = s.teacher?.id === profile?.id
                  const other = isTeacher ? s.learner : s.teacher
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                      <td><strong>{s.skill?.name}</strong></td>
                      <td>{other?.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                        {new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                    </motion.tr>
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
