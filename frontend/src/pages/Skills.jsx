import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import client from '../api/client'
import { fadeUp, fadeUpInView, stagger, cardVariant } from '../lib/motionVariants'

export default function Skills() {
  const [tab, setTab] = useState('my')
  const [mySkills, setMySkills] = useState([])
  const [categories, setCategories] = useState([])
  const [browseSkills, setBrowseSkills] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ categoryId: '', skillName: '', type: 'OFFER', level: 'BEGINNER', description: '', tags: '' })
  const [error, setError] = useState('')

  const loadMySkills = () => client.get('/skills/my').then(r => setMySkills(r.data))

  useEffect(() => {
    loadMySkills()
    client.get('/skills/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => {
    if (tab === 'browse') {
      if (searchQuery.length > 1) {
        client.get(`/skills/search?q=${searchQuery}`).then(r => setBrowseSkills(r.data))
      } else if (selectedCategory) {
        client.get(`/skills/category/${selectedCategory}`).then(r => setBrowseSkills(r.data))
      } else {
        client.get('/skills/all').then(r => setBrowseSkills(r.data)).catch(() => setBrowseSkills([]))
      }
    }
  }, [tab, searchQuery, selectedCategory])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/skills/my', {
        ...form,
        categoryId: Number(form.categoryId),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      })
      setShowForm(false)
      setForm({ categoryId: '', skillName: '', type: 'OFFER', level: 'BEGINNER', description: '', tags: '' })
      loadMySkills()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add skill')
    }
  }

  const handleDelete = async (id) => {
    await client.delete(`/skills/my/${id}`)
    loadMySkills()
  }

  const offers = mySkills.filter(s => s.type === 'OFFER')
  const seeks = mySkills.filter(s => s.type === 'SEEK')

  return (
    <div className="page">
      <motion.div className="page-header" {...fadeUp(0)}>
        <h1>Skills</h1>
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {showForm ? 'Cancel' : '+ Add Skill'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="card form-card"
            initial={{ opacity: 0, y: -16, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
          >
            <h3>Add a Skill</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Skill Name</label>
                  <input type="text" value={form.skillName} onChange={e => setForm({ ...form, skillName: e.target.value })} required placeholder="e.g. Guitar, Python, Chess" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="OFFER">I can teach this</option>
                    <option value="SEEK">I want to learn this</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated, optional)</label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. beginner-friendly, online-ok, hands-on" />
              </div>
              <motion.button className="btn btn-primary" type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Save Skill
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="tabs" {...fadeUp(0.1)}>
        <button className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Skills</button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse All</button>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'my' && (
          <motion.div
            key="my"
            className="skills-columns"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <h3 className="skills-section-title">What I Teach ({offers.length})</h3>
              {offers.length === 0 ? (
                <p className="muted">None added yet.</p>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {offers.map(s => <SkillRow key={s.id} skill={s} onDelete={handleDelete} />)}
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="skills-section-title">What I Want to Learn ({seeks.length})</h3>
              {seeks.length === 0 ? (
                <p className="muted">None added yet.</p>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  {seeks.map(s => <SkillRow key={s.id} skill={s} onDelete={handleDelete} />)}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="browse-controls">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedCategory('') }}
              />
              <span>or filter by category:</span>
              <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSearchQuery('') }}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {browseSkills.length === 0 ? (
              <p className="muted">No skills found.</p>
            ) : (
              <motion.div
                className="skill-grid"
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {browseSkills.map(s => (
                  <motion.div
                    key={s.id}
                    className="card skill-browse-card"
                    variants={cardVariant}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <strong>{s.name}</strong>
                    <span className="muted">{s.category?.name}</span>
                    {s.tags?.length > 0 && (
                      <div className="tags">
                        {s.tags.map(t => <span key={t.id} className="tag">{t.name}</span>)}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkillRow({ skill, onDelete }) {
  return (
    <motion.div className="skill-row" variants={cardVariant} whileHover={{ x: 4, transition: { duration: 0.2 } }}>
      <div>
        <strong>{skill.skill?.name}</strong>
        <span className="muted"> · {skill.skill?.category?.name} · {skill.level}</span>
        {skill.description && <p className="skill-desc">{skill.description}</p>}
        {skill.skill?.tags?.length > 0 && (
          <div className="tags">
            {skill.skill.tags.map(t => <span key={t.id} className="tag">{t.name}</span>)}
          </div>
        )}
      </div>
      <motion.button
        className="btn btn-sm btn-danger"
        onClick={() => onDelete(skill.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Remove
      </motion.button>
    </motion.div>
  )
}
