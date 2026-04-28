function StarDisplay({ rating, count, label, sessions }) {
  const stars = Math.round(rating)
  return (
    <div className="profile-stat-block">
      <div className="profile-stat-header">{label}</div>
      <div className="profile-stat-stars">
        {[1, 2, 3, 4, 5].map(s => (
          <span key={s} className={s <= stars ? 'star star-filled' : 'star star-empty'}>★</span>
        ))}
        <span className="profile-stat-avg">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      </div>
      <div className="profile-stat-meta">
        {count > 0 ? `${count} review${count !== 1 ? 's' : ''}` : 'No reviews yet'}
        {sessions > 0 ? ` · ${sessions} session${sessions !== 1 ? 's' : ''}` : ''}
      </div>
    </div>
  )
}

export default function ProfileStats({ profile }) {
  if (!profile) return null

  const hasAnyData = profile.teachingReviewCount > 0 || profile.learningReviewCount > 0
    || profile.sessionsTaught > 0 || profile.sessionsLearned > 0

  if (!hasAnyData && profile.teachingRating === 0 && profile.learningRating === 0) {
    return null
  }

  return (
    <div className="profile-stats-row">
      <StarDisplay
        rating={profile.teachingRating || 0}
        count={profile.teachingReviewCount || 0}
        label="As a Teacher"
        sessions={profile.sessionsTaught || 0}
      />
      <StarDisplay
        rating={profile.learningRating || 0}
        count={profile.learningReviewCount || 0}
        label="As a Learner"
        sessions={profile.sessionsLearned || 0}
      />
    </div>
  )
}
