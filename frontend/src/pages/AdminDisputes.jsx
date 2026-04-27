import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function AdminDisputes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/dashboard'); return }
    load()
  }, [])

  const load = () => {
    client.get('/disputes/open').then(r => setDisputes(r.data)).finally(() => setLoading(false))
  }

  const resolve = async (disputeId, resolution) => {
    await client.post('/disputes/resolve', { disputeId, resolution, adminNotes })
    setResolving(null)
    setAdminNotes('')
    load()
  }

  if (loading) return <div className="loading">Loading disputes...</div>

  return (
    <div className="page">
      <h1>Open Disputes</h1>
      {disputes.length === 0 ? (
        <div className="empty-state"><p>No open disputes.</p></div>
      ) : (
        disputes.map(d => (
          <div key={d.id} className="card dispute-card">
            <div className="dispute-header">
              <span className="badge badge-disputed">OPEN</span>
              <span className="muted">Dispute #{d.id}</span>
            </div>
            <div className="session-row"><span className="label">Filed by</span><span>{d.filedBy?.name}</span></div>
            <div className="session-row"><span className="label">Session</span><span>#{d.session?.id} — {d.session?.skill?.name}</span></div>
            <div className="session-row"><span className="label">Date</span><span>{d.session?.scheduledAt ? new Date(d.session.scheduledAt).toLocaleString() : '—'}</span></div>
            <div className="session-row"><span className="label">Reason</span><span>{d.reason}</span></div>
            <div className="session-row"><span className="label">Filed at</span><span>{new Date(d.createdAt).toLocaleString()}</span></div>

            {resolving === d.id ? (
              <div className="resolve-form">
                <div className="form-group">
                  <label>Admin Notes</label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} />
                </div>
                <div className="dispute-actions">
                  <button className="btn btn-success" onClick={() => resolve(d.id, 'RESOLVED_REFUND')}>
                    Refund Learner
                  </button>
                  <button className="btn btn-primary" onClick={() => resolve(d.id, 'RESOLVED_RELEASE')}>
                    Pay Teacher
                  </button>
                  <button className="btn" onClick={() => setResolving(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setResolving(d.id)}>
                Resolve
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
