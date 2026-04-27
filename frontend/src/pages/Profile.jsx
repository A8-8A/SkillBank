import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import AvailabilityGrid from '../components/AvailabilityGrid'

export default function Profile() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const isOwn = !userId || String(userId) === String(currentUser?.userId)
  const targetId = isOwn ? currentUser?.userId : userId

  const [profile, setProfile]     = useState(null)
  const [skills, setSkills]       = useState([])
  const [slots, setSlots]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [editForm, setEditForm]   = useState({})
  const [booking, setBooking]     = useState(null)
  const [teacherSkills, setTeacherSkills] = useState([])
  const [bookForm, setBookForm]   = useState({ skillId: '', scheduledAt: '', notes: '' })
  const [bookError, setBookError] = useState('')
  const [bookSuccess, setBookSuccess] = useState('')

  const load = () => {
    if (!targetId) return
    setLoading(true)
    client.get(`/users/${targetId}`)
      .then(p => {
        setProfile(p.data)
        setEditForm({
          name: p.data.name,
          bio: p.data.bio || '',
          city: p.data.city || '',
          phoneNumber: p.data.phoneNumber || ''
        })
      })
      .finally(() => setLoading(false))

    client.get(`/skills/user/${targetId}`).then(r => setSkills(r.data)).catch(() => {})
    client.get(`/availability/${targetId}`).then(r => setSlots(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [targetId])

  const handleToggle = async (dayOfWeek, hour) => {
    const { data } = await client.post('/availability/toggle', { dayOfWeek, hour: String(hour) })
    setSlots(prev =>
      data.available
        ? [...prev, { dayOfWeek: data.dayOfWeek, hour: data.hour }]
        : prev.filter(s => !(s.dayOfWeek === data.dayOfWeek && s.hour === data.hour))
    )
  }

  const handleSlotClick = async ({ dayOfWeek, hour, suggestedDate }) => {
    const res = await client.get(`/skills/user/${targetId}`)
    setTeacherSkills(res.data.filter(s => s.type === 'OFFER'))
    setBookForm({ skillId: '', scheduledAt: suggestedDate, notes: '' })
    setBookError('')
    setBookSuccess('')
    setBooking({ dayOfWeek, hour, suggestedDate })
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    setBookError('')
    try {
      await client.post('/sessions', {
        teacherId: Number(targetId),
        skillId: Number(bookForm.skillId),
        scheduledAt: bookForm.scheduledAt,
        durationMinutes: 60,
        notes: bookForm.notes
      })
      setBookSuccess('Session booked! 1 credit held. Waiting for teacher to confirm (they have 24h).')
      setBooking(null)
    } catch (err) {
      setBookError(err.response?.data?.error || 'Booking failed')
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    await client.patch('/users/me', editForm)
    setEditing(false)
    load()
  }

  if (loading) return <div className="loading">Loading profile...</div>
  if (!profile) return <div className="loading">User not found.</div>

  const offers = skills.filter(s => s.type === 'OFFER')
  const seeks  = skills.filter(s => s.type === 'SEEK')

  return (
    <div className="page">
      {bookSuccess && <div className="alert alert-success">{bookSuccess}</div>}

      <div className="card profile-header-card">
        <div
          className="profile-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80')" }}
        />
        <div className="profile-body">
          {/* Avatar row — overlaps cover via negative margin */}
          <div className="profile-avatar-row">
            <div className="profile-avatar">{profile.name?.[0]?.toUpperCase()}</div>
            {isOwn && !editing && (
              <button className="btn btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>

          {/* Info row — always in beige area, never over photo */}
          <div className="profile-info">
            {editing ? (
              <form onSubmit={saveProfile} className="edit-profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} placeholder="+1 234 567 8900" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={2} />
                </div>
                <div className="profile-edit-actions">
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                  <button type="button" className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h1>{profile.name}</h1>
                <div className="profile-meta">
                  {profile.city && <span>📍 {profile.city}</span>}
                  {profile.phoneNumber && <span>📞 {profile.phoneNumber}</span>}
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-GB', { month:'short', year:'numeric' })}</span>
                </div>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                {isOwn && (
                  <div className="profile-actions-row">
                    <span className="balance-badge">{profile.balance} hrs available</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="skills-columns">
        <div className="card">
          <h3 className="skills-section-title">Teaches ({offers.length})</h3>
          {offers.length === 0 ? <p className="muted">Nothing listed yet.</p>
            : offers.map(s => (
              <div key={s.id} className="skill-tag-row">
                <strong>{s.skill?.name}</strong>
                <span className="muted"> · {s.skill?.category?.name} · {s.level}</span>
              </div>
            ))}
        </div>
        <div className="card">
          <h3 className="skills-section-title">Wants to Learn ({seeks.length})</h3>
          {seeks.length === 0 ? <p className="muted">Nothing listed yet.</p>
            : seeks.map(s => (
              <div key={s.id} className="skill-tag-row">
                <strong>{s.skill?.name}</strong>
                <span className="muted"> · {s.skill?.category?.name}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="card">
        <h2>{isOwn ? 'My Availability' : `${profile.name}'s Availability`}</h2>
        {!isOwn && slots.length === 0 ? (
          <p className="muted">This user hasn't set their availability yet.</p>
        ) : (
          <AvailabilityGrid
            slots={slots}
            isOwner={isOwn}
            onToggle={handleToggle}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Book a 1-hour session</h2>
            <p className="muted">With {profile.name} · 1 credit will be held</p>
            {bookError && <div className="alert alert-error">{bookError}</div>}
            <form onSubmit={submitBooking}>
              <div className="form-group">
                <label>Skill to Learn</label>
                <select value={bookForm.skillId} onChange={e => setBookForm({...bookForm, skillId: e.target.value})} required>
                  <option value="">Select skill</option>
                  {teacherSkills.map(s => (
                    <option key={s.id} value={s.skill.id}>{s.skill.name} ({s.level})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={bookForm.scheduledAt}
                  onChange={e => setBookForm({...bookForm, scheduledAt: e.target.value})}
                  required
                />
                <span className="muted" style={{fontSize:'0.8rem'}}>Must be at least 24 hours from now</span>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea value={bookForm.notes} onChange={e => setBookForm({...bookForm, notes: e.target.value})} rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book &amp; Hold 1 Credit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
