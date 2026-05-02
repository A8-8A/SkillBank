import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import ReviewModal from './ReviewModal'

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  REFUNDED: 'Refunded',
}

function getSkillName(session) {
  return session.skillName ?? session.skill?.name ?? ''
}

function buildGoogleCalUrl(session) {
  const skill = getSkillName(session)
  const start = new Date(session.scheduledAt)
  const end = new Date(start.getTime() + session.durationMinutes * 60000)
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const title = encodeURIComponent(`SkillBank: ${skill}`)
  const details = encodeURIComponent(
    `Skill: ${skill}\nTeacher: ${session.teacher?.name}\nLearner: ${session.learner?.name}${session.notes ? '\nNotes: ' + session.notes : ''}`
  )
  return `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}`
}

export default function SessionCard({ session, onRefresh, onUpdate, onRemove, hasOverlap }) {
  const { user } = useAuth()
  // Use server-provided role when available; fall back to ID comparison
  const isTeacher = session.role
    ? session.role === 'TEACHER'
    : String(session.teacher?.id) === String(user?.userId)
  const isLearner = session.role
    ? session.role === 'LEARNER'
    : String(session.learner?.id) === String(user?.userId)

  const scheduledAt = new Date(session.scheduledAt)
  const endTime = new Date(scheduledAt.getTime() + session.durationMinutes * 60000)
  const now = new Date()
  const duringSession = now >= scheduledAt && now <= endTime

  const [showReview, setShowReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    if (session.status === 'COMPLETED') {
      client.get(`/reviews/check/${session.id}`)
        .then(r => setHasReviewed(r.data.reviewed))
        .catch(() => {})
    }
  }, [session.id, session.status])

  const confirm = async () => {
    if (onUpdate) onUpdate({ ...session, status: 'CONFIRMED' })
    try {
      const { data } = await client.post(`/sessions/${session.id}/confirm`)
      if (onUpdate) onUpdate(data)
    } catch {
      if (onUpdate) onUpdate(session)
      else onRefresh()
    }
  }

  const cancel = async () => {
    if (onUpdate) onUpdate({ ...session, status: 'CANCELLED' })
    try {
      const { data } = await client.post(`/sessions/${session.id}/cancel`)
      if (onUpdate) onUpdate(data)
    } catch {
      if (onUpdate) onUpdate(session)
      else onRefresh()
    }
  }

  const fileDispute = async () => {
    const reason = window.prompt('Describe the issue (e.g. teacher did not show up):')
    if (!reason) return
    await client.post('/disputes', { sessionId: session.id, reason })
    onRefresh()
  }

  return (
    <div className="card session-card">
      {hasOverlap && (
        <div className="session-overlap-warning">
          <span>⚠ Overlaps with another session</span>
          {isTeacher && (
            <button className="btn btn-danger btn-sm" onClick={async () => {
              if (onRemove) onRemove(session.id)
              try { await client.post(`/sessions/${session.id}/cancel`) }
              catch { onRefresh() }
            }}>Remove</button>
          )}
        </div>
      )}
      <div className="session-header">
        <span className={`badge badge-${session.status.toLowerCase()}`}>
          {STATUS_LABELS[session.status]}
        </span>
        <span className="session-skill">{getSkillName(session)}</span>
      </div>
      <div className="session-body">
        <div className="session-row">
          <span className="label">Teacher</span>
          <span>{session.teacher?.name}</span>
        </div>
        <div className="session-row">
          <span className="label">Learner</span>
          <span>{session.learner?.name}</span>
        </div>
        <div className="session-row">
          <span className="label">When</span>
          <span>{scheduledAt.toLocaleString()}</span>
        </div>
        <div className="session-row">
          <span className="label">Duration</span>
          <span>{session.durationMinutes} min</span>
        </div>
        {session.notes && (
          <div className="session-row">
            <span className="label">Notes</span>
            <span>{session.notes}</span>
          </div>
        )}
      </div>
      <div className="session-actions">
        {isTeacher && session.status === 'PENDING' && (
          <>
            <button className="btn btn-success" onClick={confirm}>Confirm</button>
            <button className="btn btn-danger" onClick={cancel}>Reject</button>
          </>
        )}
        {session.status === 'CONFIRMED' && (
          <a
            href={buildGoogleCalUrl(session)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
          >
            Add to Google Calendar
          </a>
        )}
        {isLearner && session.status === 'CONFIRMED' && duringSession && (
          <button className="btn btn-warning" onClick={fileDispute}>
            Report No-Show
          </button>
        )}
        {session.status === 'COMPLETED' && !hasReviewed && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowReview(true)}>
            Leave a Review
          </button>
        )}
        {session.status === 'COMPLETED' && hasReviewed && (
          <span className="muted" style={{ fontSize: '0.85rem' }}>Reviewed</span>
        )}
      </div>

      {showReview && (
        <ReviewModal
          session={session}
          isTeacher={isTeacher}
          onClose={() => setShowReview(false)}
          onSubmit={() => { setShowReview(false); setHasReviewed(true); onRefresh() }}
        />
      )}
    </div>
  )
}
