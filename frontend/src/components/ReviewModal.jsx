import { useState } from 'react'
import client from '../api/client'

export default function ReviewModal({ session, isTeacher, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [teacherOnTime, setTeacherOnTime] = useState(null)
  const [contentUseful, setContentUseful] = useState(null)
  const [wouldRecommend, setWouldRecommend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isLearner = !isTeacher

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a rating'); return }
    setError('')
    setLoading(true)
    try {
      await client.post('/reviews', {
        sessionId: session.id,
        rating,
        comment: comment || null,
        teacherOnTime: isLearner ? teacherOnTime : null,
        contentUseful: isLearner ? contentUseful : null,
        wouldRecommend
      })
      onSubmit()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const otherPerson = isTeacher ? session.learner?.name : session.teacher?.name
  const reviewLabel = isTeacher ? 'Rate your learner' : 'Rate your teacher'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{reviewLabel}</h2>
        <p className="muted">Session: {session.skillName ?? session.skill?.name} with {otherPerson}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'star-filled' : 'star-empty'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
              {rating > 0 && <span className="star-label">{rating}/5</span>}
            </div>
          </div>

          {isLearner && (
            <div className="feedback-questions">
              <div className="feedback-q">
                <span>Did the teacher show up on time?</span>
                <div className="feedback-btns">
                  <button type="button" className={`fbtn ${teacherOnTime === true ? 'fbtn-yes' : ''}`} onClick={() => setTeacherOnTime(true)}>Yes</button>
                  <button type="button" className={`fbtn ${teacherOnTime === false ? 'fbtn-no' : ''}`} onClick={() => setTeacherOnTime(false)}>No</button>
                </div>
              </div>
              <div className="feedback-q">
                <span>Was the content useful?</span>
                <div className="feedback-btns">
                  <button type="button" className={`fbtn ${contentUseful === true ? 'fbtn-yes' : ''}`} onClick={() => setContentUseful(true)}>Yes</button>
                  <button type="button" className={`fbtn ${contentUseful === false ? 'fbtn-no' : ''}`} onClick={() => setContentUseful(false)}>No</button>
                </div>
              </div>
            </div>
          )}

          <div className="feedback-q" style={{ marginTop: '0.75rem' }}>
            <span>Would you recommend {otherPerson}?</span>
            <div className="feedback-btns">
              <button type="button" className={`fbtn ${wouldRecommend === true ? 'fbtn-yes' : ''}`} onClick={() => setWouldRecommend(true)}>Yes</button>
              <button type="button" className={`fbtn ${wouldRecommend === false ? 'fbtn-no' : ''}`} onClick={() => setWouldRecommend(false)}>No</button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Share your experience..." />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
