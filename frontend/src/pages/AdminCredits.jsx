import { useState } from 'react'
import client from '../api/client'

export default function AdminCredits() {
  const [creditEmail, setCreditEmail] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [creditAction, setCreditAction] = useState('add')
  const [creditMsg, setCreditMsg] = useState('')
  const [creditError, setCreditError] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)

  const handleCredit = async (e) => {
    e.preventDefault()
    setCreditMsg('')
    setCreditError('')
    setCreditLoading(true)

    try {
      const endpoint = creditAction === 'add' ? '/admin/credits/add' : '/admin/credits/deduct'
      const res = await client.post(endpoint, {
        email: creditEmail,
        amount: parseFloat(creditAmount)
      })
      setCreditMsg(`${res.data.message}. New balance: ${res.data.newBalance}`)
      setCreditAmount('')
    } catch (err) {
      setCreditError(
        err.response?.data?.error
        || err.response?.data?.message
        || 'Operation failed — please try again'
      )
    } finally {
      setCreditLoading(false)
    }
  }

  return (
    <div className="page">
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong>Quick reference:</strong><br />
            1 credit purchase = $15<br />
            5 credits purchase = $60<br />
            5 credits redemption = $50 payout
          </p>
        </div>
      </div>
    </div>
  )
}
