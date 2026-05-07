import { useState } from 'react'
import { createPortal } from 'react-dom'
import client from '../api/client'

export default function DisputeModal({ session, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) { setError('Please describe the issue'); return }
    setError('')
    setLoading(true)
    try {
      await client.post('/disputes', { sessionId: session.id, reason: reason.trim() })
      onSubmit()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  const skillName = session.skillName ?? session.skill?.name ?? ''

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Report No-Show</h2>
        <p className="muted">Session: {skillName} with {session.teacher?.name}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What happened?</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Teacher did not show up, session started 30 minutes late, content was completely different from what was agreed..."
              required
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '-0.5rem' }}>
            An admin will review your report and decide whether to refund your credit. Please be as specific as possible.
          </p>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={loading || !reason.trim()}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
