import { motion } from 'framer-motion'

const SKILLS = [
  'Guitar', 'Python', 'French', 'Photography', 'Cooking', 'Chess', 'Yoga',
  'JavaScript', 'Drawing', 'Spanish', 'Piano', 'Fitness', 'Design', 'Math',
  'Arabic', 'Video Editing', 'Public Speaking', 'Pottery', 'Swimming', 'Excel',
]

export default function Marquee({ speed = 35 }) {
  const items = [...SKILLS, ...SKILLS]
  const duration = items.length * (speed / SKILLS.length)

  return (
    <div className="marquee-wrapper" aria-hidden="true">
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      >
        {items.map((skill, i) => (
          <span key={i} className="marquee-item">
            {skill} <span className="marquee-dot">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
