const HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1]
const DAYS  = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function formatHour(h) {
  if (h === 0)  return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function nextOccurrence(dayOfWeek, hour) {
  const dayIndex = { MONDAY:1, TUESDAY:2, WEDNESDAY:3, THURSDAY:4, FRIDAY:5, SATURDAY:6, SUNDAY:0 }
  const target = dayIndex[dayOfWeek]
  const minTime = new Date(Date.now() + 25 * 60 * 60 * 1000) // 25h buffer

  let d = new Date()
  d.setHours(hour, 0, 0, 0)

  for (let i = 0; i < 14; i++) {
    if (d.getDay() === target && d >= minTime) return d
    d = new Date(d)
    d.setDate(d.getDate() + 1)
    d.setHours(hour, 0, 0, 0)
  }
  return null
}

function toLocalDateTimeInput(date) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`
}

export default function AvailabilityGrid({ slots, isOwner, onToggle, onSlotClick }) {
  const getSlot = (day, hour) =>
    slots.find(s => s.dayOfWeek === day && s.hour === hour)

  const isAvailable = (day, hour) => !!getSlot(day, hour)

  const isBooked = (day, hour) => {
    const slot = getSlot(day, hour)
    return slot?.booked === true
  }

  const handleClick = (day, hour) => {
    const booked = isBooked(day, hour)

    if (isOwner) {
      if (booked) return // Can't remove booked slots
      onToggle(day, hour)
    } else if (isAvailable(day, hour) && !booked) {
      const date = nextOccurrence(day, hour)
      if (!date) return
      onSlotClick({ dayOfWeek: day, hour, suggestedDate: toLocalDateTimeInput(date) })
    }
  }

  return (
    <div className="availability-wrapper">
      <table className="availability-table">
        <thead>
          <tr>
            <th className="hour-col"></th>
            {DAY_SHORT.map(d => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td className="hour-label">{formatHour(hour)}</td>
              {DAYS.map(day => {
                const avail = isAvailable(day, hour)
                const booked = isBooked(day, hour)
                return (
                  <td
                    key={day}
                    className={`slot-cell ${
                      booked ? 'slot-booked' :
                      avail ? 'slot-available' :
                      'slot-empty'
                    } ${
                      isOwner
                        ? (booked ? 'slot-locked' : 'slot-owner')
                        : (avail && !booked ? 'slot-bookable' : '')
                    }`}
                    onClick={() => handleClick(day, hour)}
                    title={
                      booked
                        ? (isOwner ? 'Booked — cannot remove until session is cancelled or rejected' : 'Already booked')
                        : avail
                          ? (isOwner ? 'Click to remove' : `Book ${day} ${formatHour(hour)}`)
                          : (isOwner ? 'Click to add' : '')
                    }
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="availability-legend">
        <span className="legend-item"><span className="legend-dot slot-available"></span> Available</span>
        <span className="legend-item"><span className="legend-dot slot-booked"></span> Booked</span>
        <span className="legend-item"><span className="legend-dot slot-empty"></span> Not set</span>
      </div>
      {isOwner && (
        <p className="availability-hint">Click a cell to mark/unmark your availability. Each slot = 1 hour. Booked slots (red) cannot be removed.</p>
      )}
    </div>
  )
}
