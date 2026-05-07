import { useState } from 'react'
import { createPortal } from 'react-dom'
import client from '../api/client'

const TEACHING_QUESTIONS = [
  { key: 'teacherOnTime', label: 'Did the teacher show up on time?' },
  { key: 'contentUseful', label: 'Was the session content well-structured?' },
  { key: 'wouldRecommend', label: 'Was the session interactive?' },
]

const LEARNING_QUESTIONS = [
  { key: 'teacherOnTime', label: 'Did the learner show up on time?' },
  { key: 'contentUseful', label: 'Was the learner engaged and attentive?' },
  { key: 'wouldRecommend', label: 'Did the learner come prepared?' },
]

export default function ReviewModal({ session, isTeacher, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [answers, setAnswers] = useState({ teacherOnTime: null, contentUseful: null, wouldRecommend: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isLearner = !isTeacher
  const questions = isLearner ? TEACHING_QUESTIONS : LEARNING_QUESTIONS

  const setAnswer = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }))

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
        teacherOnTime: answers.teacherOnTime,
        contentUseful: answers.contentUseful,
        wouldRecommend: answers.wouldRecommend
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

  return createPortal(
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

          <div className="feedback-questions">
            {questions.map(q => (
              <div key={q.key} className="feedback-q">
                <span>{q.label}</span>
                <div className="feedback-btns">
                  <button type="button" className={`fbtn ${answers[q.key] === true ? 'fbtn-yes' : ''}`} onClick={() => setAnswer(q.key, true)}>Yes</button>
                  <button type="button" className={`fbtn ${answers[q.key] === false ? 'fbtn-no' : ''}`} onClick={() => setAnswer(q.key, false)}>No</button>
                </div>
              </div>
            ))}
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
    </div>,
    document.body
  )
}
