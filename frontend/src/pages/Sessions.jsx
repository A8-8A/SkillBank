import { useState, useEffect } from 'react'
import client from '../api/client'
import SessionCard from '../components/SessionCard'

export default function Sessions() {
  const [tab, setTab] = useState('all')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const endpoint = tab === 'teaching' ? '/sessions/teaching'
      : tab === 'learning' ? '/sessions/learning'
      : '/sessions'
    client.get(endpoint)
      .then(r => setSessions(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  return (
    <div className="page">
      <h1>Sessions</h1>

      <div className="tabs">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
        <button className={`tab ${tab === 'teaching' ? 'active' : ''}`} onClick={() => setTab('teaching')}>Teaching</button>
        <button className={`tab ${tab === 'learning' ? 'active' : ''}`} onClick={() => setTab('learning')}>Learning</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions found.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map(s => (
            <SessionCard key={s.id} session={s} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  )
}
