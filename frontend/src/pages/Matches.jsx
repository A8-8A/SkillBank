import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Matches() {
  const [tab, setTab] = useState('all')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadMatches()
  }, [tab])

  const loadMatches = () => {
    setLoading(true)
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

  return (
    <div className="page">
      <h1>Matches</h1>
      <p className="muted">Find people to exchange skills with. Click "View Profile" to see their availability and book a session.</p>

      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Users
        </button>
        <button className={`tab ${tab === 'one-way' ? 'active' : ''}`} onClick={() => setTab('one-way')}>
          They teach me
        </button>
        <button className={`tab ${tab === 'mutual' ? 'active' : ''}`} onClick={() => setTab('mutual')}>
          Mutual
        </button>
      </div>

      {tab === 'all' && (
        <form onSubmit={handleSearch} className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search by name, skill, category, or tag..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="search-bar-input"
          />
        </form>
      )}

      {loading ? <div className="loading" />
        : matches.length === 0 ? (
          <div className="empty-state">
            <p>{
              tab === 'all'       ? (searchQuery ? `No users found matching "${searchQuery}".` : 'No other users found.') :
              tab === 'one-way'   ? 'No one found teaching what you want to learn yet.' :
                                    'No mutual matches yet. Add more skills you offer and seek.'
            }</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map(m => (
              <div key={m.userId} className="card match-card">
                <div className="match-header">
                  <div>
                    <h3>{m.name}</h3>
                    {m.city && <span className="muted">{m.city}</span>}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/user/${m.userId}`)}>
                    View Profile
                  </button>
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
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
