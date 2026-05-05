import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import api from '@/services/api.js'

const T = {
  ink:'#070504', ink2:'#0F0B09', bone:'#E8DFC8',
  blood:'#8B1A1A', blood2:'#6B0F0F',
  dim1:'rgba(232,223,200,.75)', dim2:'rgba(232,223,200,.22)',
}
const sf   = { fontFamily:"'Bebas Neue',sans-serif" }
const mono = { fontFamily:"'Courier Prime',monospace" }
const rub  = { fontFamily:"'Boogaloo',cursive" }
const PILL = '8px 14px 8px 14px / 14px 8px 14px 8px'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function ClientReschedulePage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const apptId         = searchParams.get('appt')

  const [appt,       setAppt]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [slots,      setSlots]      = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [note,       setNote]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState('')

  const today = new Date()
  today.setHours(0,0,0,0)
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!apptId) { setError('No appointment specified.'); setLoading(false); return }
    api.get(`appointments/${apptId}/`)
      .then(d => setAppt(d))
      .catch(() => setError('Could not load appointment.'))
      .finally(() => setLoading(false))
  }, [apptId, user, navigate])

  useEffect(() => {
    if (!selectedDate || !appt?.barber?.id) return
    setSlotsLoading(true)
    setSelectedTime(null)
    const dateStr = selectedDate.toISOString().split('T')[0]
    api.get(`barbers/${appt.barber.id}/slots/?date=${dateStr}`)
      .then(d => setSlots(Array.isArray(d) ? d : d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, appt])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a new date and time.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      await api.post(`appointments/${apptId}/reschedule/`, {
        new_date: dateStr,
        new_time: selectedTime,
        note: note.trim(),
      })
      setDone(true)
    } catch(e) {
      setError(e.response?.data?.error || e.message || 'Could not submit reschedule request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:T.ink,display:'flex',
      alignItems:'center',justifyContent:'center',...sf,fontSize:24,
      color:T.dim1,letterSpacing:'.1em'}}>Loading...</div>
  )

  if (done) return (
    <div style={{minHeight:'100vh',background:T.ink,display:'flex',
      alignItems:'center',justifyContent:'center',padding:24,flexDirection:'column',gap:16,textAlign:'center'}}>
      <span style={{fontSize:56}}>✂️</span>
      <h1 style={{...sf,fontSize:40,color:T.bone,textShadow:`3px 3px 0 ${T.blood}`,margin:0}}>
        Reschedule Requested!
      </h1>
      <p style={{...mono,fontSize:13,color:T.dim1,maxWidth:340,lineHeight:1.7}}>
        Your barber will review and approve or decline your request. You'll get a notification either way.
      </p>
      <button onClick={()=>navigate('/dashboard')} style={{
        ...rub,fontSize:16,letterSpacing:'.12em',textTransform:'uppercase',
        background:T.blood,color:T.bone,border:`3px solid ${T.bone}`,
        borderRadius:50,padding:'12px 32px',cursor:'pointer',
        boxShadow:`4px 4px 0 ${T.bone}`,marginTop:8,
      }}>Back to My Bookings</button>
    </div>
  )

  // Calendar
  const daysInMonth  = getDaysInMonth(calYear, calMonth)
  const firstDay     = getFirstDay(calYear, calMonth)
  const monthNames   = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December']
  const dayNames     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y=>y-1); setCalMonth(11) }
    else setCalMonth(m=>m-1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y=>y+1); setCalMonth(0) }
    else setCalMonth(m=>m+1)
  }

  const isDisabled = (day) => {
    const d = new Date(calYear, calMonth, day)
    d.setHours(0,0,0,0)
    return d <= today // disable today and past
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    return selectedDate.getFullYear()===calYear &&
           selectedDate.getMonth()===calMonth &&
           selectedDate.getDate()===day
  }

  return (
    <div style={{minHeight:'100vh',background:T.ink,padding:'32px 16px',
      display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:520}}>

        {/* header */}
        <div style={{marginBottom:28}}>
          <p style={{...mono,fontSize:9,letterSpacing:'.4em',
            textTransform:'uppercase',color:T.blood,marginBottom:6}}>
            ✂ Reschedule Appointment
          </p>
          <h1 style={{...sf,fontSize:42,color:T.bone,
            textShadow:`3px 3px 0 ${T.blood}`,lineHeight:.9,marginBottom:8}}>
            Pick a New<br/>Time
          </h1>
          {appt && (
            <div style={{...mono,fontSize:12,color:T.dim1,
              background:T.ink2,border:`1px solid ${T.dim2}`,
              borderRadius:8,padding:'10px 14px',marginTop:12}}>
              Current: <strong style={{color:T.bone}}>
                {appt.service_name || appt.service?.name} · {appt.date} at {appt.time}
              </strong>
            </div>
          )}
        </div>

        {error && (
          <div style={{...mono,fontSize:13,color:'#f87171',
            background:'rgba(248,113,113,.08)',border:'2px solid rgba(248,113,113,.3)',
            borderRadius:8,padding:'12px 16px',marginBottom:20,textAlign:'center'}}>
            {error}
          </div>
        )}

        {/* Calendar */}
        <div style={{background:T.ink2,border:`3px solid ${T.dim2}`,
          borderRadius:'12px 8px 12px 8px',padding:20,marginBottom:16}}>

          <div style={{display:'flex',alignItems:'center',
            justifyContent:'space-between',marginBottom:16}}>
            <button onClick={prevMonth} style={{...sf,fontSize:20,color:T.bone,
              background:'none',border:'none',cursor:'pointer',padding:'4px 8px'}}>‹</button>
            <span style={{...sf,fontSize:20,color:T.bone,letterSpacing:'.06em'}}>
              {monthNames[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={{...sf,fontSize:20,color:T.bone,
              background:'none',border:'none',cursor:'pointer',padding:'4px 8px'}}>›</button>
          </div>

          {/* Day names */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',
            gap:4,marginBottom:6}}>
            {dayNames.map(d=>(
              <div key={d} style={{...mono,fontSize:10,color:T.dim1,
                textAlign:'center',letterSpacing:'.1em'}}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
            {Array.from({length:firstDay}).map((_,i)=>(
              <div key={`e${i}`}/>
            ))}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day = i + 1
              const disabled = isDisabled(day)
              const selected = isSelected(day)
              return (
                <button key={day}
                  disabled={disabled}
                  onClick={()=>!disabled && setSelectedDate(new Date(calYear,calMonth,day))}
                  style={{
                    ...mono, fontSize:13,
                    background: selected ? T.blood : 'transparent',
                    color: disabled ? 'rgba(232,223,200,.2)' : selected ? T.bone : T.dim1,
                    border: selected ? `2px solid ${T.bone}` : '2px solid transparent',
                    borderRadius:'6px 4px 6px 4px',
                    padding:'7px 4px', cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign:'center', transition:'all .15s',
                    boxShadow: selected ? `2px 2px 0 ${T.bone}` : 'none',
                  }}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div style={{background:T.ink2,border:`3px solid ${T.dim2}`,
            borderRadius:'8px 12px 8px 12px',padding:20,marginBottom:16}}>
            <p style={{...mono,fontSize:10,letterSpacing:'.25em',
              textTransform:'uppercase',color:T.dim1,marginBottom:12}}>
              Available Times — {selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}
            </p>
            {slotsLoading ? (
              <p style={{...mono,fontSize:12,color:T.dim1}}>Loading slots...</p>
            ) : slots.length === 0 ? (
              <p style={{...mono,fontSize:12,color:'rgba(248,113,113,.7)'}}>
                No available slots on this day. Pick another date.
              </p>
            ) : (
              <div style={{display:'grid',
                gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
                {slots.map(slot => {
                  const time = typeof slot === 'string' ? slot : slot.time
                  const sel  = selectedTime === time
                  return (
                    <button key={time} onClick={()=>setSelectedTime(time)} style={{
                      ...mono, fontSize:12,
                      background: sel ? T.blood : 'transparent',
                      color: sel ? T.bone : T.dim1,
                      border: `2px solid ${sel ? T.bone : T.dim2}`,
                      borderRadius:PILL, padding:'8px 4px',
                      cursor:'pointer', textAlign:'center',
                      boxShadow: sel ? `2px 2px 0 ${T.bone}` : 'none',
                      transition:'all .15s',
                    }}>
                      {time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div style={{marginBottom:20}}>
          <label style={{...mono,fontSize:10,letterSpacing:'.25em',
            textTransform:'uppercase',color:T.dim1,display:'block',marginBottom:8}}>
            Note for barber (optional)
          </label>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Any reason for rescheduling?"
            rows={3} style={{
              width:'100%',background:T.ink2,
              border:`2px solid ${T.dim2}`,borderRadius:8,
              color:T.bone,...mono,fontSize:13,
              padding:'10px 14px',outline:'none',resize:'none',
              boxSizing:'border-box',transition:'border-color .2s',
            }}
            onFocus={e=>e.target.style.borderColor=T.blood}
            onBlur={e=>e.target.style.borderColor=T.dim2}
          />
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:12}}>
          <button onClick={()=>navigate('/dashboard')} style={{
            ...mono,fontSize:12,letterSpacing:'.15em',textTransform:'uppercase',
            background:'none',color:T.dim1,
            border:`2px solid ${T.dim2}`,borderRadius:50,
            padding:'12px 20px',cursor:'pointer',
          }}>← Cancel</button>
          <button onClick={handleSubmit}
            disabled={submitting || !selectedDate || !selectedTime}
            style={{
              flex:1,...rub,fontSize:16,letterSpacing:'.12em',textTransform:'uppercase',
              background: (!selectedDate||!selectedTime) ? T.blood2 : T.blood,
              color:T.bone,border:`3px solid ${T.bone}`,
              borderRadius:PILL,padding:'13px 24px',
              cursor: (!selectedDate||!selectedTime||submitting) ? 'not-allowed' : 'pointer',
              opacity: (!selectedDate||!selectedTime||submitting) ? .6 : 1,
              boxShadow:`4px 4px 0 ${T.bone}`,transition:'all .2s',
            }}>
            {submitting ? 'Requesting...' : '↻ Request Reschedule'}
          </button>
        </div>

      </div>
    </div>
  )
}
