import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/admin/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading" />

  return (
    <div className="page">
      <div className="admin-header">
        <h1>Admin Overview</h1>
        <p className="muted">Platform activity and management</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats?.totalUsers ?? 0}</div>
          <div className="admin-stat-label">Registered Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats?.totalSessions ?? 0}</div>
          <div className="admin-stat-label">Total Sessions</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats?.totalSkills ?? 0}</div>
          <div className="admin-stat-label">Skills in Catalog</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats?.totalUserSkills ?? 0}</div>
          <div className="admin-stat-label">Skill Listings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats?.totalTransactions ?? 0}</div>
          <div className="admin-stat-label">Transactions</div>
        </div>
      </div>

      <div className="admin-quick-links">
        <h2>Manage</h2>
        <div className="admin-links-row">
          <Link to="/admin/users" className="admin-link-card">
            <h3>Users</h3>
            <p>View all registered users, their balances, and account details</p>
          </Link>
          <Link to="/admin/sessions" className="admin-link-card">
            <h3>Sessions</h3>
            <p>Monitor all sessions — pending, confirmed, completed, and cancelled</p>
          </Link>
          <Link to="/admin/credits" className="admin-link-card">
            <h3>Credits</h3>
            <p>Add or deduct credits for user purchases and redemptions</p>
          </Link>
          <Link to="/admin/disputes" className="admin-link-card">
            <h3>Disputes</h3>
            <p>Review and resolve reported session issues</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
