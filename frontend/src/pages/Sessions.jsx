import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import SessionCard from '../components/SessionCard'
import { fadeUp, stagger, cardVariant } from '../lib/motionVariants'

export default function Sessions() {
  const [tab, setTab] = useState('all')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)
  const reqId = useRef(0)

  const handleSessionUpdate = (updated) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const handleSessionRemove = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const activeSessions = sessions.filter(s => s.status !== 'CANCELLED')
  const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED')

  // Detect sessions whose time windows overlap with another active session
  const overlappingIds = new Set()
  const activeForOverlap = sessions.filter(s => s.status === 'PENDING' || s.status === 'CONFIRMED')
  for (let i = 0; i < activeForOverlap.length; i++) {
    for (let j = i + 1; j < activeForOverlap.length; j++) {
      const a = activeForOverlap[i], b = activeForOverlap[j]
      const aStart = new Date(a.scheduledAt), aEnd = new Date(aStart.getTime() + a.durationMinutes * 60000)
      const bStart = new Date(b.scheduledAt), bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000)
      if (aStart < bEnd && bStart < aEnd) {
        overlappingIds.add(a.id)
        overlappingIds.add(b.id)
      }
    }
  }

  const load = (currentTab) => {
    const id = ++reqId.current
    setLoading(true)
    setError('')
    setSessions([])
    const endpoint = currentTab === 'teaching' ? '/sessions/teaching'
      : currentTab === 'learning' ? '/sessions/learning'
      : '/sessions'
    client.get(endpoint)
      .then(r => { if (id === reqId.current) setSessions(r.data) })
      .catch(() => { if (id === reqId.current) setError('Failed to load sessions. Please try again.') })
      .finally(() => { if (id === reqId.current) setLoading(false) })
  }

  useEffect(() => { load(tab) }, [tab])

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
        ) : activeSessions.length === 0 && cancelledSessions.length === 0 && !error ? (
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
        ) : activeSessions.length > 0 ? (
          <motion.div
            key={tab}
            className="sessions-grid"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <AnimatePresence>
              {activeSessions.map(s => (
                <motion.div
                  key={s.id}
                  variants={cardVariant}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                  layout
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <SessionCard
                    session={s}
                    onRefresh={() => load(tab)}
                    onUpdate={handleSessionUpdate}
                    onRemove={handleSessionRemove}
                    hasOverlap={overlappingIds.has(s.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!loading && cancelledSessions.length > 0 && (
        <motion.div
          className="cancelled-history"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className="cancelled-history-toggle"
            onClick={() => setShowCancelled(prev => !prev)}
          >
            <span>Cancelled History ({cancelledSessions.length})</span>
            <motion.span
              animate={{ rotate: showCancelled ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'inline-block' }}
            >▼</motion.span>
          </button>
          <AnimatePresence>
            {showCancelled && (
              <motion.div
                className="sessions-grid cancelled-history-grid"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {cancelledSessions.map(s => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <SessionCard
                      session={s}
                      onRefresh={() => load(tab)}
                      onUpdate={handleSessionUpdate}
                      onRemove={handleSessionRemove}
                      hasOverlap={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
