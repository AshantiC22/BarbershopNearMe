import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

const BARBERS  = ['Marcus Jones','Terrence Ace','Lena Pham']
const SERVICES = [
  { name:'The Classic',    price:'$28', duration:'30 min' },
  { name:'Straight Shave', price:'$35', duration:'45 min' },
  { name:'Full Service',   price:'$55', duration:'60 min' },
  { name:'Beard Line',     price:'$22', duration:'20 min' },
]
const TIMES  = ['9:00','9:30','10:00','10:30','11:00','11:30','1:00','1:30','2:00','2:30','3:00','3:30']
const TAKEN  = new Set(['10:30','1:30','3:00'])

/* ── colour tokens ── */
const T = {
  ink:   '#070504',
  ink2:  '#0F0B09',
  ink3:  '#181210',
  bone:  '#E8DFC8',
  blood: '#8B1A1A',
  dim1:  'rgba(232,223,200,.55)',
  dim2:  'rgba(232,223,200,.14)',
  dim3:  'rgba(232,223,200,.06)',
}

/* ── reusable field ── */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display: 'block', fontFamily: "'Courier Prime',monospace",
        fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase',
        color: T.dim1, marginBottom: 7,
      }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `1px solid ${T.dim2}`,
  color: T.bone, fontFamily: "'Courier Prime',monospace",
  fontSize: 14, padding: '10px 0', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none', transition: 'border-color .2s',
}

/* ── step indicator ── */
function Steps({ current }) {
  const steps = ['Choose Service','Pick a Barber','Select Time','Confirm']
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:40 }}>
      {steps.map((s,i) => (
        <div key={s} style={{ display:'flex', alignItems:'center', flex: i<steps.length-1?1:'unset' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{
              width:32, height:32,
              borderRadius:'50%',
              border:`2px solid ${i<=current?T.blood:T.dim2}`,
              background: i<current?T.blood : i===current?'rgba(139,26,26,.15)':'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Bebas Neue',sans-serif", fontSize:14,
              color: i<=current?T.bone:T.dim1,
              transition:'all .3s',
              flexShrink:0,
            }}>
              {i<current ? '✓' : i+1}
            </div>
            <span style={{
              fontFamily:"'Courier Prime',monospace", fontSize:9,
              letterSpacing:'.18em', textTransform:'uppercase',
              color: i===current?T.bone:T.dim1, whiteSpace:'nowrap',
            }}>{s}</span>
          </div>
          {i<steps.length-1 && (
            <div style={{
              flex:1, height:1, margin:'0 8px', marginBottom:22,
              background: i<current?T.blood:T.dim2, transition:'background .3s',
            }}/>
          )}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════ */
export default function PortalPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [step,        setStep]        = useState(0)
  const [service,     setService]     = useState(null)
  const [barber,      setBarber]      = useState(null)
  const [date,        setDate]        = useState('')
  const [time,        setTime]        = useState(null)
  const [name,        setName]        = useState(user?.name || '')
  const [phone,       setPhone]       = useState('')
  const [notes,       setNotes]       = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  /* ── redirect to login if not authed ── */
  if (!user) {
    return (
      <div style={{
        minHeight:'100vh', background:T.ink,
        display:'flex', alignItems:'center', justifyContent:'center',
        flexDirection:'column', gap:24, padding:24,
      }}>
        <div style={{
          fontFamily:"'Bebas Neue',sans-serif",fontSize:28,
          letterSpacing:'.1em', color:T.bone, textAlign:'center',
        }}>
          Sign in to book your appointment
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login" style={{
            fontFamily:"'Boogaloo',cursive", fontSize:16, letterSpacing:'.12em',
            textTransform:'uppercase', background:T.blood, color:T.bone,
            border:`3px solid ${T.bone}`, borderRadius:50,
            padding:'11px 28px', textDecoration:'none',
            boxShadow:`4px 4px 0 ${T.bone}`,
          }}>Sign In</Link>
          <Link to="/signup" style={{
            fontFamily:"'Boogaloo',cursive", fontSize:16, letterSpacing:'.12em',
            textTransform:'uppercase', background:'transparent', color:T.bone,
            border:`3px solid rgba(232,223,200,.4)`, borderRadius:50,
            padding:'11px 24px', textDecoration:'none',
            boxShadow:`3px 3px 0 rgba(232,223,200,.2)`,
          }}>Sign Up</Link>
        </div>
      </div>
    )
  }

  /* ── confirmation screen ── */
  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', background:T.ink, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:480 }}>
          {/* animated scissors */}
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ margin:'0 auto 24px', animation:'floatBob 3s ease-in-out infinite' }}>
            <circle cx="16" cy="16" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
            <circle cx="16" cy="56" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
            <line x1="24" y1="22" x2="66" y2="64" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
            <line x1="24" y1="50" x2="66" y2="8" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="4" fill="#8B1A1A"/>
            <circle cx="16" cy="56" r="4" fill="#8B1A1A"/>
          </svg>
          <style>{`
        @keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes portalPageIn{from{opacity:0;transform:translate3d(0,10px,0);}to{opacity:1;transform:translate3d(0,0,0);}}
      `}</style>

          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(48px,10vw,80px)', lineHeight:.9, color:T.bone, textShadow:`3px 3px 0 ${T.blood}`, marginBottom:16 }}>
            You're<br/>Booked.
          </h1>
          <div style={{
            background:T.ink2, border:`1px solid ${T.dim2}`, borderTop:`3px solid ${T.blood}`,
            borderRadius:'2px 2px 10px 10px', padding:'28px 32px', marginBottom:28, textAlign:'left',
          }}>
            {[
              ['Service',  service?.name],
              ['Barber',   barber],
              ['Date',     date],
              ['Time',     time],
              ['Name',     name],
              phone && ['Phone', phone],
            ].filter(Boolean).map(([k,v]) => (
              <div key={k} style={{
                display:'flex', justifyContent:'space-between', alignItems:'baseline',
                padding:'10px 0', borderBottom:`1px solid ${T.dim2}`,
              }}>
                <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.25em', textTransform:'uppercase', color:T.dim1 }}>{k}</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, letterSpacing:'.06em', color:T.bone }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.12em', color:T.dim1, marginBottom:28 }}>
            See you soon, {user.name}. Don't be late — the blade won't wait.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => { setSubmitted(false); setStep(0); setService(null); setBarber(null); setDate(''); setTime(null) }} style={{
              fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.12em', textTransform:'uppercase',
              background:T.blood, color:T.bone, border:`3px solid ${T.bone}`,
              borderRadius:50, padding:'11px 24px', cursor:'pointer',
              boxShadow:`4px 4px 0 ${T.bone}`,
            }}>Book Another</button>
            <Link to="/" style={{
              fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.12em', textTransform:'uppercase',
              background:'transparent', color:T.bone, border:`3px solid rgba(232,223,200,.35)`,
              borderRadius:50, padding:'11px 22px', textDecoration:'none',
              boxShadow:`3px 3px 0 rgba(232,223,200,.2)`,
            }}>Home</Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── submit ── */
  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false)
    setSubmitted(true)
  }

  /* ── card shell ── */
  const Card = ({ children }) => (
    <div style={{
      background:T.ink2, border:`1px solid ${T.dim2}`, borderTop:`3px solid ${T.blood}`,
      borderRadius:'2px 2px 10px 10px', padding:'36px 36px 40px',
    }}>{children}</div>
  )

  /* ── step content ── */
  const renderStep = () => {
    switch(step) {
      /* STEP 0 — choose service */
      case 0: return (
        <Card>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, marginBottom:6 }}>Choose Your Service</h2>
          <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.dim1, marginBottom:28 }}>What are we doing today?</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {SERVICES.map(s => (
              <button key={s.name} onClick={() => setService(s)} style={{
                background: service?.name===s.name ? 'rgba(139,26,26,.2)' : T.ink3,
                border: `2px solid ${service?.name===s.name ? T.blood : T.dim2}`,
                borderRadius:'10px 7px 10px 7px / 7px 10px 7px 10px',
                padding:'18px 16px', cursor:'pointer', textAlign:'left',
                transition:'all .2s',
                boxShadow: service?.name===s.name ? `3px 3px 0 ${T.blood}` : 'none',
              }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, marginBottom:4 }}>{s.name}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:T.bone }}>{s.price}</span>
                  <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:T.dim1 }}>{s.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )

      /* STEP 1 — pick barber */
      case 1: return (
        <Card>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, marginBottom:6 }}>Pick Your Barber</h2>
          <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.dim1, marginBottom:28 }}>Who's holding the blade?</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {BARBERS.map((b,i) => (
              <button key={b} onClick={() => setBarber(b)} style={{
                display:'flex', alignItems:'center', gap:16,
                background: barber===b ? 'rgba(139,26,26,.18)' : T.ink3,
                border: `2px solid ${barber===b ? T.blood : T.dim2}`,
                borderRadius:'8px 12px 8px 12px / 12px 8px 12px 8px',
                padding:'16px 20px', cursor:'pointer', textAlign:'left',
                transition:'all .2s',
                boxShadow: barber===b ? `3px 3px 0 ${T.blood}` : 'none',
              }}>
                {/* initials badge */}
                <div style={{
                  width:44, height:44, borderRadius:'50%', flexShrink:0,
                  border:`2px solid ${barber===b?T.blood:T.dim2}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:16,
                  color: barber===b?T.blood:T.dim1,
                  transition:'all .2s',
                }}>
                  {b.split(' ').map(w=>w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, lineHeight:1, marginBottom:3 }}>{b}</div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:T.dim1 }}>
                    {['Head Blade','The Closer','The Architect'][i]}
                  </div>
                </div>
                {barber===b && <div style={{ marginLeft:'auto', color:T.blood, fontSize:18 }}>✓</div>}
              </button>
            ))}
          </div>
        </Card>
      )

      /* STEP 2 — date + time */
      case 2: return (
        <Card>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, marginBottom:6 }}>Select Date & Time</h2>
          <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.dim1, marginBottom:28 }}>When do you want to come in?</p>
          <Field label="Date">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
              onFocus={e=>e.target.style.borderBottomColor=T.blood}
              onBlur={e=>e.target.style.borderBottomColor=T.dim2}
            />
          </Field>
          <div style={{ marginTop:8 }}>
            <label style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.28em', textTransform:'uppercase', color:T.dim1, display:'block', marginBottom:12 }}>Available Times</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 }}>
              {TIMES.map(t => (
                <button key={t} onClick={() => !TAKEN.has(t) && setTime(t)} style={{
                  background: time===t?T.blood : TAKEN.has(t)?'transparent':T.ink3,
                  border: `1px solid ${time===t?T.bone : TAKEN.has(t)?T.dim2:'rgba(232,223,200,.18)'}`,
                  borderRadius:'6px 9px 6px 9px / 9px 6px 9px 6px',
                  fontFamily:"'Courier Prime',monospace", fontSize:11,
                  color: time===t?T.bone : TAKEN.has(t)?T.dim2:T.dim1,
                  padding:'10px 4px', textAlign:'center',
                  cursor: TAKEN.has(t)?'not-allowed':'pointer',
                  textDecoration: TAKEN.has(t)?'line-through':'none',
                  opacity: TAKEN.has(t)?.2:1,
                  transition:'all .18s',
                  boxShadow: time===t?`2px 2px 0 ${T.bone}`:'none',
                  transform: time===t?'scale(1.06)':'scale(1)',
                }}>{t}</button>
              ))}
            </div>
          </div>
        </Card>
      )

      /* STEP 3 — confirm */
      case 3: return (
        <Card>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:'.06em', textTransform:'uppercase', color:T.bone, marginBottom:6 }}>Confirm & Book</h2>
          <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.dim1, marginBottom:28 }}>Review your appointment</p>

          {/* summary */}
          <div style={{ background:T.ink3, border:`1px solid ${T.dim2}`, borderRadius:8, padding:'16px 20px', marginBottom:28 }}>
            {[
              ['Service', service?.name + '  ' + service?.price],
              ['Barber',  barber],
              ['Date',    date],
              ['Time',    time],
            ].map(([k,v]) => (
              <div key={k} style={{
                display:'flex', justifyContent:'space-between',
                padding:'8px 0', borderBottom:`1px solid ${T.dim2}`,
              }}>
                <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.25em', textTransform:'uppercase', color:T.dim1 }}>{k}</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:'.06em', color:T.bone }}>{v}</span>
              </div>
            ))}
          </div>

          <Field label="Your Name">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jack Pepper"
              style={inputStyle}
              onFocus={e=>e.target.style.borderBottomColor=T.blood}
              onBlur={e=>e.target.style.borderBottomColor=T.dim2}/>
          </Field>
          <Field label="Phone (optional)">
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(601) 555-0100"
              style={inputStyle}
              onFocus={e=>e.target.style.borderBottomColor=T.blood}
              onBlur={e=>e.target.style.borderBottomColor=T.dim2}/>
          </Field>
          <Field label="Notes (optional)">
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything we should know..."
              rows={3} style={{
                ...inputStyle, resize:'vertical', borderBottom:'none',
                border:`1px solid ${T.dim2}`, borderRadius:6, padding:'10px 12px',
              }}
              onFocus={e=>e.target.style.borderColor=T.blood}
              onBlur={e=>e.target.style.borderColor=T.dim2}/>
          </Field>

          <button onClick={handleSubmit} disabled={submitting} style={{
            width:'100%', marginTop:8,
            fontFamily:"'Boogaloo',cursive", fontSize:18, letterSpacing:'.14em', textTransform:'uppercase',
            background: submitting?'#5C0E0E':T.blood, color:T.bone,
            border:`3px solid ${T.bone}`,
            borderRadius:'8px 14px 8px 14px / 14px 8px 14px 8px',
            padding:'15px 32px',
            boxShadow: submitting?`2px 2px 0 ${T.bone}`:`5px 5px 0 ${T.bone}`,
            cursor: submitting?'not-allowed':'pointer',
            opacity: submitting?.7:1, transition:'all .2s',
          }}>
            {submitting ? 'Booking...' : '✂  Lock the Chair'}
          </button>
        </Card>
      )
    }
  }

  /* ── can advance? ── */
  const canNext = [
    !!service,
    !!barber,
    !!date && !!time,
    !!name,
  ][step]

  return (
    <div style={{ minHeight:'100vh', background:T.ink, fontFamily:"'Courier Prime',monospace", animation:'portalPageIn .55s cubic-bezier(.16,1,.3,1) both' }}>
      <style>{`
        @keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes portalPageIn{from{opacity:0;transform:translate3d(0,10px,0);}to{opacity:1;transform:translate3d(0,0,0);}}
      `}</style>

      {/* ── portal navbar ── */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:T.ink, borderBottom:`2px solid ${T.bone}`,
        height:58, display:'flex', alignItems:'center',
      }}>
        <div style={{
          width:'100%', maxWidth:860, margin:'0 auto', padding:'0 32px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <Link to="/" style={{
            fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:'.2em',
            textTransform:'uppercase', color:T.bone, textDecoration:'none',
          }}>Barbershopnearme</Link>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <span style={{ fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:T.dim1 }}>
              👋 {user.name}
            </span>
            <button onClick={() => { logout(); navigate('/') }} style={{
              fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.22em',
              textTransform:'uppercase', background:'transparent', border:`1px solid ${T.dim2}`,
              borderRadius:4, padding:'6px 12px', color:T.dim1, cursor:'pointer',
              transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.color=T.blood}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.dim2;e.currentTarget.style.color=T.dim1}}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── main ── */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'48px 32px' }}>

        {/* header */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, color:T.blood, letterSpacing:'.2em' }}>CLIENT PORTAL</span>
            <div style={{ width:36, height:2, background:T.bone, opacity:.3, borderRadius:2 }}/>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(36px,6vw,56px)', lineHeight:.9, letterSpacing:'.04em', textTransform:'uppercase', color:T.bone }}>
            Book Your<br/>Appointment
          </h1>
        </div>

        {/* steps */}
        <Steps current={step}/>

        {/* step card */}
        {renderStep()}

        {/* nav buttons */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, gap:12 }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s-1)} style={{
              fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.12em', textTransform:'uppercase',
              background:'transparent', color:T.bone, border:`3px solid rgba(232,223,200,.35)`,
              borderRadius:50, padding:'11px 24px', cursor:'pointer',
              boxShadow:`3px 3px 0 rgba(232,223,200,.2)`,
            }}>← Back</button>
          ) : (
            <Link to="/" style={{
              fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.12em', textTransform:'uppercase',
              background:'transparent', color:T.dim1, border:`3px solid ${T.dim2}`,
              borderRadius:50, padding:'11px 24px', textDecoration:'none',
              boxShadow:`2px 2px 0 ${T.dim2}`,
            }}>← Home</Link>
          )}

          {step < 3 && (
            <button
              onClick={() => canNext && setStep(s => s+1)}
              disabled={!canNext}
              style={{
                fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.12em', textTransform:'uppercase',
                background: canNext?T.blood:'transparent',
                color: canNext?T.bone:T.dim1,
                border: `3px solid ${canNext?T.bone:T.dim2}`,
                borderRadius:50, padding:'11px 28px', cursor: canNext?'pointer':'not-allowed',
                boxShadow: canNext?`4px 4px 0 ${T.bone}`:`2px 2px 0 ${T.dim2}`,
                opacity: canNext?1:.45, transition:'all .2s',
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
