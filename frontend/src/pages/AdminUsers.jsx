import { useState, useEffect } from 'react'
import client from '../api/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    client.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loading" />

  return (
    <div className="page">
      <h1>All Users</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {users.length} registered user{users.length !== 1 ? 's' : ''} on the platform
      </p>

      <input
        type="text"
        placeholder="Search by name, email, or city..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-bar-input"
        style={{ marginBottom: '1.5rem' }}
      />

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Balance</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                <td>{u.city || '—'}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-confirmed' : 'badge-pending'}`}>{u.role}</span></td>
                <td>{u.emailVerified ? 'Yes' : 'No'}</td>
                <td><strong>{u.balance}</strong></td>
                <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
