import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { fadeUp, stagger, cardVariant } from '../lib/motionVariants'

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || target == null) return
    if (target === 0) { setValue(0); return }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setValue(Math.round(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { value, ref }
}

function StatCard({ number, label, delay = 0 }) {
  const { value, ref } = useCountUp(number)
  return (
    <motion.div
      className="admin-stat-card"
      ref={ref}
      variants={cardVariant}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="admin-stat-number">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/admin/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading" />

  const statItems = [
    { number: stats?.totalUsers ?? 0, label: 'Registered Users' },
    { number: stats?.totalSessions ?? 0, label: 'Total Sessions' },
    { number: stats?.totalSkills ?? 0, label: 'Skills in Catalog' },
    { number: stats?.totalUserSkills ?? 0, label: 'Skill Listings' },
    { number: stats?.totalTransactions ?? 0, label: 'Transactions' },
  ]

  const links = [
    { to: '/admin/users', title: 'Users', desc: 'View all registered users, their balances, and account details' },
    { to: '/admin/sessions', title: 'Sessions', desc: 'Monitor all sessions — pending, confirmed, completed, and cancelled' },
    { to: '/admin/credits', title: 'Credits', desc: 'Add or deduct credits for user purchases and redemptions' },
    { to: '/admin/disputes', title: 'Disputes', desc: 'Review and resolve reported session issues' },
  ]

  return (
    <div className="page">
      <motion.div className="admin-header" {...fadeUp(0)}>
        <h1>Admin Overview</h1>
        <p className="muted">Platform activity and management</p>
      </motion.div>

      <motion.div
        className="admin-stats-grid"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {statItems.map((s, i) => (
          <StatCard key={i} number={s.number} label={s.label} delay={i * 0.08} />
        ))}
      </motion.div>

      <motion.div className="admin-quick-links" {...fadeUp(0.2)}>
        <h2>Manage</h2>
        <motion.div
          className="admin-links-row"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {links.map((l, i) => (
            <motion.div key={i} variants={cardVariant} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Link to={l.to} className="admin-link-card">
                <h3>{l.title}</h3>
                <p>{l.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
