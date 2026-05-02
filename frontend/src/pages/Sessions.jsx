import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import SessionCard from '../components/SessionCard'
import { fadeUp, stagger, cardVariant } from '../lib/motionVariants'

export default function Sessions() {
  const [tab, setTab] = useState('all')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    const endpoint = tab === 'teaching' ? '/sessions/teaching'
      : tab === 'learning' ? '/sessions/learning'
      : '/sessions'
    client.get(endpoint)
      .then(r => setSessions(r.data))
      .catch(() => setError('Failed to load sessions. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  return (
    <div className="page">
      <motion.h1 {...fadeUp(0)}>Sessions</motion.h1>

      <motion.div className="tabs" {...fadeUp(0.08)}>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
        <button className={`tab ${tab === 'teaching' ? 'active' : ''}`} onClick={() => setTab('teaching')}>Teaching</button>
        <button className={`tab ${tab === 'learning' ? 'active' : ''}`} onClick={() => setTab('learning')}>Learning</button>
      </motion.div>

      {error && <div className="alert alert-error">{error}</div>}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        ) : sessions.length === 0 ? (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p>No sessions found.</p>
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            className="sessions-grid"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {sessions.map(s => (
              <motion.div key={s.id} variants={cardVariant} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <SessionCard session={s} onRefresh={load} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
