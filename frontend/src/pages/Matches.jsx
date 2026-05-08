import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import { fadeUp, stagger, cardVariant } from '../lib/motionVariants'

export default function Matches() {
  const [tab, setTab] = useState('all')
  const [matches, setMatches] = useState([])
  const [categories, setCategories] = useState([])
  const [skillCategoryMap, setSkillCategoryMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/skills/all')
      .then(r => {
        const map = {}
        r.data.forEach(s => { map[s.name] = s.category?.name })
        setSkillCategoryMap(map)
      })
      .catch(() => {})

    client.get('/skills/categories')
      .then(r => setCategories(r.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadMatches()
  }, [tab])

  const loadMatches = () => {
    setLoading(true)
    setFilterCategory('')
    const endpoint = tab === 'mutual'
      ? '/matches/mutual'
      : tab === 'one-way'
      ? '/matches/one-way'
      : `/matches/all${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`
    client.get(endpoint).then(r => setMatches(r.data)).finally(() => setLoading(false))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (tab === 'all') loadMatches()
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    if (tab === 'all') {
      clearTimeout(window._matchSearchTimeout)
      window._matchSearchTimeout = setTimeout(() => {
        setLoading(true)
        const endpoint = value
          ? `/matches/all?q=${encodeURIComponent(value)}`
          : '/matches/all'
        client.get(endpoint).then(r => setMatches(r.data)).finally(() => setLoading(false))
      }, 400)
    }
  }

  // Categories that have at least one teacher in current matches
  const activeCategories = new Set(
    matches.flatMap(m => m.skillsTheyOffer.map(s => skillCategoryMap[s]).filter(Boolean))
  )

  const filteredMatches = filterCategory
    ? matches.filter(m => m.skillsTheyOffer.some(s => skillCategoryMap[s] === filterCategory))
    : matches

  return (
    <div className="page">
      <motion.h1 {...fadeUp(0)}>Matches</motion.h1>
      <motion.p className="muted" {...fadeUp(0.08)}>
        Find people to exchange skills with. Click a name or photo to view their profile.
      </motion.p>

      <motion.div className="tabs" {...fadeUp(0.12)}>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Users</button>
        <button className={`tab ${tab === 'one-way' ? 'active' : ''}`} onClick={() => setTab('one-way')}>They teach me</button>
        <button className={`tab ${tab === 'mutual' ? 'active' : ''}`} onClick={() => setTab('mutual')}>Mutual</button>
      </motion.div>

      <AnimatePresence>
        {tab === 'all' && (
          <motion.form
            onSubmit={handleSearch}
            className="search-bar-wrapper"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              placeholder="Search by name, skill, category, or tag..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="search-bar-input"
            />
          </motion.form>
        )}
      </AnimatePresence>

      {categories.length > 0 && (
        <motion.div className="category-bubbles-section" {...fadeUp(0.18)}>
          <span className="category-bubbles-label">Filter by category</span>
          <div className="category-bubbles">
            {categories.map((cat, i) => {
              const available = activeCategories.has(cat.name)
              const active = filterCategory === cat.name
              return (
                <motion.button
                  key={cat.id}
                  className={`category-bubble${active ? ' category-bubble-active' : ''}${!available ? ' category-bubble-empty' : ''}`}
                  onClick={() => available && setFilterCategory(active ? '' : cat.name)}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={available ? { scale: 1.07, y: -2 } : {}}
                  whileTap={available ? { scale: 0.84, rotateX: 16, rotateY: -8 } : {}}
                  style={{ transformPerspective: 500 }}
                >
                  {cat.name}
                  {!available && <span className="bubble-none-label"> · no one</span>}
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence>
            {filterCategory && (
              <motion.button
                className="btn btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: '.5rem' }}
                onClick={() => setFilterCategory('')}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                Clear · {filterCategory}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        ) : filteredMatches.length === 0 ? (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p>{
              filterCategory   ? `No one teaches a "${filterCategory}" skill yet.` :
              tab === 'all'    ? (searchQuery ? `No users found matching "${searchQuery}".` : 'No other users found.') :
              tab === 'one-way'? 'No one found teaching what you want to learn yet.' :
                                 'No mutual matches yet. Add more skills you offer and seek.'
            }</p>
          </motion.div>
        ) : (
          <motion.div
            key={tab + searchQuery + filterCategory}
            className="matches-grid"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {filteredMatches.map(m => (
              <motion.div
                key={m.userId}
                className="card match-card"
                variants={cardVariant}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="match-header">
                  <div className="match-user-link" onClick={() => navigate(`/user/${m.userId}`)}>
                    <div
                      className="match-avatar"
                      style={{
                        backgroundImage: m.profilePicUrl ? `url(${m.profilePicUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!m.profilePicUrl && m.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="match-name-link">{m.name}</h3>
                      {m.city && <span className="muted">{m.city}</span>}
                    </div>
                  </div>
                </div>
                {m.bio && <p className="match-bio">{m.bio}</p>}
                <div className="match-skills">
                  {m.skillsTheyOffer.length > 0 && (
                    <div>
                      <span className="skill-type-label offer">Teachable Skills</span>
                      <div className="tags">
                        {m.skillsTheyOffer.map(s => <span key={s} className="tag">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {m.skillsTheySeek.length > 0 && (
                    <div>
                      <span className="skill-type-label seek">Learnable Skills</span>
                      <div className="tags">
                        {m.skillsTheySeek.map(s => <span key={s} className="tag tag-seek">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {m.skillsTheyOffer.length === 0 && m.skillsTheySeek.length === 0 && (
                    <p className="muted" style={{ fontSize: '0.85rem' }}>No skills listed yet</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
