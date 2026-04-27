import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Matches() {
  const [tab, setTab] = useState('mutual')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const endpoint = tab === 'mutual'
      ? '/matches/mutual'
      : tab === 'one-way'
      ? '/matches/one-way'
      : '/matches/seeking-me'
    client.get(endpoint).then(r => setMatches(r.data)).finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="page">
      <h1>Matches</h1>
      <p className="muted">People you can exchange skills with. Click "View Profile" to see their availability and book a slot.</p>

      <div className="tabs">
        <button className={`tab ${tab === 'mutual' ? 'active' : ''}`} onClick={() => setTab('mutual')}>
          Mutual
        </button>
        <button className={`tab ${tab === 'one-way' ? 'active' : ''}`} onClick={() => setTab('one-way')}>
          They teach me
        </button>
        <button className={`tab ${tab === 'seeking-me' ? 'active' : ''}`} onClick={() => setTab('seeking-me')}>
          Want my skills
        </button>
      </div>

      {loading ? <div className="loading" />
        : matches.length === 0 ? (
          <div className="empty-state">
            <p>{
              tab === 'mutual'    ? 'No mutual matches yet. Add more skills you offer and seek.' :
              tab === 'one-way'   ? 'No one found teaching what you want to learn yet.' :
                                   'No one is seeking your skills yet. Make sure you have skills listed as Teach.'
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
                  <div>
                    <span className="skill-type-label offer">Teaches</span>
                    <div className="tags">
                      {m.skillsTheyOffer.map(s => <span key={s} className="tag">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <span className="skill-type-label seek">Wants to Learn</span>
                    <div className="tags">
                      {m.skillsTheySeek.map(s => <span key={s} className="tag tag-seek">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

    </div>
  )
}
