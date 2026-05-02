import { motion } from 'framer-motion'

function StarDisplay({ rating, count, label, sessions }) {
  const stars = Math.round(rating)
  return (
    <div className="profile-stat-block">
      <div className="profile-stat-header">{label}</div>
      <div className="profile-stat-stars">
        {[1, 2, 3, 4, 5].map((s, i) => (
          <motion.span
            key={s}
            className={s <= stars ? 'star star-filled' : 'star star-empty'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3, type: 'spring', stiffness: 300 }}
          >
            ★
          </motion.span>
        ))}
        <motion.span
          className="profile-stat-avg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {rating > 0 ? rating.toFixed(1) : '—'}
        </motion.span>
      </div>
      <motion.div
        className="profile-stat-meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {count > 0 ? `${count} review${count !== 1 ? 's' : ''}` : 'No reviews yet'}
        {sessions > 0 ? ` · ${sessions} session${sessions !== 1 ? 's' : ''}` : ''}
      </motion.div>
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
    <motion.div
      className="profile-stats-row"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
    </motion.div>
  )
}
