import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function AdminDisputes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('disputes')
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  // Credit management state
  const [creditEmail, setCreditEmail] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [creditAction, setCreditAction] = useState('add')
  const [creditMsg, setCreditMsg] = useState('')
  const [creditError, setCreditError] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)

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

  const handleCredit = async (e) => {
    e.preventDefault()
    setCreditMsg('')
    setCreditError('')
    setCreditLoading(true)

    try {
      const endpoint = creditAction === 'add' ? '/admin/credits/add' : '/admin/credits/deduct'
      const { data } = await client.post(endpoint, {
        email: creditEmail,
        amount: parseFloat(creditAmount)
      })
      setCreditMsg(`${data.message}. New balance: ${data.newBalance}`)
      setCreditAmount('')
    } catch (err) {
      setCreditError(err.response?.data?.error || err.response?.data?.message || 'Operation failed')
    } finally {
      setCreditLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="page">
      {/* Tabs */}
      <div className="wallet-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`wallet-tab ${tab === 'disputes' ? 'wallet-tab-active' : ''}`}
          onClick={() => setTab('disputes')}
        >
          Disputes ({disputes.length})
        </button>
        <button
          className={`wallet-tab ${tab === 'credits' ? 'wallet-tab-active' : ''}`}
          onClick={() => setTab('credits')}
        >
          Credit Management
        </button>
      </div>

      {/* Disputes Tab */}
      {tab === 'disputes' && (
        <>
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
        </>
      )}

      {/* Credit Management Tab */}
      {tab === 'credits' && (
        <>
          <h1>Credit Management</h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Add credits after a user purchases them, or deduct credits when processing a redemption.
          </p>

          <div className="card" style={{ maxWidth: '500px', padding: '2rem' }}>
            {creditMsg && <div className="alert alert-success">{creditMsg}</div>}
            {creditError && <div className="alert alert-error">{creditError}</div>}

            <form onSubmit={handleCredit}>
              <div className="form-group">
                <label>Action</label>
                <select value={creditAction} onChange={e => setCreditAction(e.target.value)}>
                  <option value="add">Add Credits (user purchased)</option>
                  <option value="deduct">Deduct Credits (user redeemed)</option>
                </select>
              </div>

              <div className="form-group">
                <label>User Email</label>
                <input
                  type="email"
                  value={creditEmail}
                  onChange={e => setCreditEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (credits)</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  placeholder="e.g. 5"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <button
                className={`btn btn-full ${creditAction === 'add' ? 'btn-primary' : 'btn-danger'}`}
                type="submit"
                disabled={creditLoading}
                style={{ marginTop: '0.5rem' }}
              >
                {creditLoading
                  ? 'Processing...'
                  : creditAction === 'add'
                    ? `Add ${creditAmount || '...'} credits`
                    : `Deduct ${creditAmount || '...'} credits`
                }
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                <strong>Quick reference:</strong><br />
                1 credit purchase = $20<br />
                5 credits purchase = $80<br />
                5 credits redemption = $50 payout
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
