import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/admin/sessions').then(r => setSessions(r.data)).finally(() => setLoading(false))
  }, [])

  const byStatus = filter === 'ALL'
    ? sessions
    : sessions.filter(s => s.status === filter)

  const filtered = search
    ? byStatus.filter(s =>
        String(s.id).includes(search) ||
        s.teacher?.toLowerCase().includes(search.toLowerCase()) ||
        s.learner?.toLowerCase().includes(search.toLowerCase()) ||
        s.teacherEmail?.toLowerCase().includes(search.toLowerCase()) ||
        s.learnerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        s.skill?.toLowerCase().includes(search.toLowerCase())
      )
    : byStatus

  const counts = {
    ALL: sessions.length,
    PENDING: sessions.filter(s => s.status === 'PENDING').length,
    CONFIRMED: sessions.filter(s => s.status === 'CONFIRMED').length,
    COMPLETED: sessions.filter(s => s.status === 'COMPLETED').length,
    CANCELLED: sessions.filter(s => s.status === 'CANCELLED').length,
    DISPUTED: sessions.filter(s => s.status === 'DISPUTED').length,
  }

  if (loading) return <div className="loading" />

  return (
    <div className="page">
      <h1>All Sessions</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {sessions.length} total session{sessions.length !== 1 ? 's' : ''} on the platform
      </p>

      <input
        type="text"
        placeholder="Search by session ID, name, email, or skill..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-bar-input"
        style={{ marginBottom: '1rem' }}
      />

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No sessions match this filter.</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Skill</th>
                <th>Teacher</th>
                <th>Learner</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td><strong>{s.skill}</strong></td>
                  <td>
                    <div
                      className="admin-session-user"
                      onClick={() => navigate(`/user/${s.teacherId}`)}
                    >
                      {s.teacher}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.teacherEmail}</div>
                  </td>
                  <td>
                    <div
                      className="admin-session-user"
                      onClick={() => navigate(`/user/${s.learnerId}`)}
                    >
                      {s.learner}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.learnerEmail}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <br />
                    <span style={{ color: 'var(--muted)' }}>
                      {new Date(s.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td><span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
