import { useState, useEffect } from 'react'
import client from '../api/client'

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
        // Load all skills when no filter is set
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
      <div className="page-header">
        <h1>Skills</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Skill'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
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
            <button className="btn btn-primary" type="submit">Save Skill</button>
          </form>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Skills</button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse All</button>
      </div>

      {tab === 'my' && (
        <div className="skills-columns">
          <div>
            <h3 className="skills-section-title">What I Teach ({offers.length})</h3>
            {offers.length === 0 ? <p className="muted">None added yet.</p> : offers.map(s => (
              <SkillRow key={s.id} skill={s} onDelete={handleDelete} />
            ))}
          </div>
          <div>
            <h3 className="skills-section-title">What I Want to Learn ({seeks.length})</h3>
            {seeks.length === 0 ? <p className="muted">None added yet.</p> : seeks.map(s => (
              <SkillRow key={s.id} skill={s} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {tab === 'browse' && (
        <div>
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
            <div className="skill-grid">
              {browseSkills.map(s => (
                <div key={s.id} className="card skill-browse-card">
                  <strong>{s.name}</strong>
                  <span className="muted">{s.category?.name}</span>
                  {s.tags?.length > 0 && (
                    <div className="tags">
                      {s.tags.map(t => <span key={t.id} className="tag">{t.name}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SkillRow({ skill, onDelete }) {
  return (
    <div className="skill-row">
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
      <button className="btn btn-sm btn-danger" onClick={() => onDelete(skill.id)}>Remove</button>
    </div>
  )
}
