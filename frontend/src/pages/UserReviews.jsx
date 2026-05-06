import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

function StarRow({ rating }) {
  return (
    <span className="review-stars-inline">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= rating ? 'star star-filled' : 'star star-empty'}>★</span>
      ))}
    </span>
  )
}

function FeedbackBadge({ label, value }) {
  if (value === null || value === undefined) return null
  return (
    <span className={`feedback-badge ${value ? 'feedback-badge-yes' : 'feedback-badge-no'}`}>
      {label}: {value ? 'Yes' : 'No'}
    </span>
  )
}

export default function UserReviews() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(searchParams.get('tab') || 'teaching')
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get(`/users/${userId}`).then(r => setProfile(r.data)).catch(() => {})
    client.get(`/reviews/stats/${userId}`).then(r => setStats(r.data)).catch(() => {})
  }, [userId])

  useEffect(() => {
    setLoading(true)
    const endpoint = `/reviews/user/${userId}/${tab}`
    client.get(endpoint)
      .then(r => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [userId, tab])

  return (
    <div className="page">
      {/* Header */}
      <div className="reviews-page-header">
        <div>
          <button className="btn btn-sm" onClick={() => navigate(`/user/${userId}`)}>
            ← Back to Profile
          </button>
          <h1 style={{ marginTop: '0.75rem' }}>
            {profile?.name ? `${profile.name}'s Reviews` : 'Reviews'}
          </h1>
        </div>
      </div>

      {/* Summary */}
      {stats && (
        <div className="reviews-summary-row">
          <div className={`reviews-summary-card ${tab === 'teaching' ? 'reviews-summary-active' : ''}`}
               onClick={() => setTab('teaching')}>
            <div className="reviews-summary-label">As a Teacher</div>
            <div className="reviews-summary-rating">
              <StarRow rating={Math.round(stats.teachingRating || 0)} />
              <span className="reviews-summary-avg">{stats.teachingRating > 0 ? Number(stats.teachingRating).toFixed(1) : '—'}</span>
            </div>
            <div className="reviews-summary-count">
              {stats.teachingReviewCount} review{stats.teachingReviewCount !== 1 ? 's' : ''}
              {' · '}{stats.sessionsTaught} session{stats.sessionsTaught !== 1 ? 's' : ''}
            </div>
          </div>
          <div className={`reviews-summary-card ${tab === 'learning' ? 'reviews-summary-active' : ''}`}
               onClick={() => setTab('learning')}>
            <div className="reviews-summary-label">As a Learner</div>
            <div className="reviews-summary-rating">
              <StarRow rating={Math.round(stats.learningRating || 0)} />
              <span className="reviews-summary-avg">{stats.learningRating > 0 ? Number(stats.learningRating).toFixed(1) : '—'}</span>
            </div>
            <div className="reviews-summary-count">
              {stats.learningReviewCount} review{stats.learningReviewCount !== 1 ? 's' : ''}
              {' · '}{stats.sessionsLearned} session{stats.sessionsLearned !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? <div className="loading" /> : reviews.length === 0 ? (
        <div className="empty-state">
          <p>No {tab === 'teaching' ? 'teaching' : 'learning'} reviews yet.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r.id} className="review-card card">
              <div className="review-card-header">
                <div className="review-card-left">
                  <div
                    className="review-avatar"
                    style={{
                      backgroundImage: r.reviewerProfilePicUrl ? `url(${r.reviewerProfilePicUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!r.reviewerProfilePicUrl && r.reviewerName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="review-reviewer-name">{r.reviewerName}</div>
                    <div className="review-meta">
                      {r.skillName} · {new Date(r.sessionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="review-card-right">
                  <StarRow rating={r.rating} />
                </div>
              </div>

              {/* Feedback badges */}
              <div className="review-feedback-row">
                <FeedbackBadge label="On time" value={r.teacherOnTime} />
                <FeedbackBadge label="Content useful" value={r.contentUseful} />
                <FeedbackBadge label="Would recommend" value={r.wouldRecommend} />
              </div>

              {/* Comment */}
              {r.comment && (
                <div className="review-comment">
                  "{r.comment}"
                </div>
              )}

              {/* View reviewer profile */}
              <button
                className="btn btn-sm review-view-profile"
                onClick={() => navigate(`/user/${r.reviewerId}`)}
              >
                View {r.reviewerName}'s Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
