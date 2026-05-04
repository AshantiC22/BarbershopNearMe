import { useState, useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'
import RubberHoseButton from '@/components/ui/RubberHoseButton.jsx'
import { bookAppointment } from '@/services/api.js'

const SERVICES_LIST = [
  'The Classic — $28','Straight Shave — $35','Full Service — $55','Beard Line — $22',
]
const BARBERS_LIST = ['Marcus Jones','Terrence Ace','Lena Pham']
const TIMES        = ['9:00','9:30','10:00','10:30','11:00','11:30','1:00','1:30','2:00','2:30','3:00','3:30']
const TAKEN        = new Set(['10:30','1:30','3:00'])

export default function Booking() {
  const ref = useRef()
  useReveal(ref)

  const [form,   setForm]   = useState({ name:'', service:'', barber:'', date:'' })
  const [time,   setTime]   = useState(null)
  const [status, setStatus] = useState('idle')
  const [toast,  setToast]  = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.service || !form.barber || !form.date || !time) {
      alert('Please complete all fields.')
      return
    }
    setStatus('loading')
    try {
      await bookAppointment({ ...form, time })
      setToast(true)
      setForm({ name:'', service:'', barber:'', date:'' })
      setTime(null)
      setTimeout(() => setToast(false), 3500)
    } catch {
      alert('Booking failed — please try again.')
    } finally {
      setStatus('idle')
    }
  }

  const focusBlood  = (e) => { e.target.style.borderBottomColor = 'var(--color-blood)' }
  const blurRestore = (e) => { e.target.style.borderBottomColor = 'rgba(232,223,200,0.18)' }

  return (
    <section id="book" className="section" ref={ref}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">03</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Appointments</span>
        </div>

        <div className="booking-grid">

          <div className="booking-meta reveal">
            <h2 className="t-title">Make the<br/>Appointment</h2>
            <div className="booking-meta-rows">
              {[
                ['Mon – Sat','Hours'],['9am – 6pm','Open'],['(601) 307-1023','Call Us'],
              ].map(([v,k]) => (
                <div key={k} className="booking-meta-row">
                  <span className="booking-meta-val">{v}</span>
                  <span className="booking-meta-key">{k}</span>
                </div>
              ))}
            </div>
            <p className="t-body" style={{ marginTop:28 }}>
              Walk-ins welcome. Appointments get<br/>
              the first chair. Don't be late —<br/>
              the blade won't wait.
            </p>
            <svg width="56" height="56" viewBox="0 0 72 72" fill="none"
              style={{ marginTop:32,opacity:.35,animation:'floatBob 4s ease-in-out infinite' }}>
              <circle cx="16" cy="16" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
              <circle cx="16" cy="56" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
              <line x1="24" y1="22" x2="66" y2="64" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
              <line x1="24" y1="50" x2="66" y2="8"  stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="4" fill="#8B1A1A"/>
              <circle cx="16" cy="56" r="4" fill="#8B1A1A"/>
            </svg>
          </div>

          <div className="form-card reveal" style={{ transitionDelay:'.1s' }}>
            <div className="field-wrap">
              <label className="field-label">Your Name</label>
              <input className="field-input" placeholder="Jack Pepper"
                value={form.name} onChange={set('name')}
                onFocus={focusBlood} onBlur={blurRestore}/>
            </div>
            <div className="form-row field-wrap">
              <div>
                <label className="field-label">Service</label>
                <select className="field-input" value={form.service} onChange={set('service')}
                  onFocus={focusBlood} onBlur={blurRestore}>
                  <option value="">Select...</option>
                  {SERVICES_LIST.map(s=><option key={s} style={{background:'#1a1410'}}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Barber</label>
                <select className="field-input" value={form.barber} onChange={set('barber')}
                  onFocus={focusBlood} onBlur={blurRestore}>
                  <option value="">Select...</option>
                  {BARBERS_LIST.map(b=><option key={b} style={{background:'#1a1410'}}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="field-wrap">
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.date} onChange={set('date')}
                min={new Date().toISOString().split('T')[0]}
                onFocus={focusBlood} onBlur={blurRestore}/>
            </div>
            <div className="field-wrap">
              <span className="time-slots-label">Available Times</span>
              <div className="time-grid">
                {TIMES.map(t=>(
                  <button key={t}
                    className={['time-slot',time===t?'time-slot--active':'',TAKEN.has(t)?'time-slot--taken':''].join(' ')}
                    onClick={()=>!TAKEN.has(t)&&setTime(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* THE rubber hose book button */}
            <RubberHoseButton
              variant="book"
              splat="LOCKED IN!"
              onClick={handleSubmit}
              disabled={status==='loading'}
            >
              {status==='loading' ? 'Booking...' : '✂  Lock the Chair'}
            </RubberHoseButton>
          </div>
        </div>
      </div>

      <div style={{
        position:'fixed',bottom:28,left:'50%',
        transform:`translateX(-50%) translateY(${toast?'0':'160%'}) scale(${toast?1:.85})`,
        background:'var(--color-ink-2)',
        border:'1px solid var(--color-blood)',borderTop:'3px solid var(--color-blood)',
        borderRadius:50,padding:'14px 36px',
        fontFamily:'var(--font-rubber)',fontSize:15,letterSpacing:'.14em',
        textTransform:'uppercase',color:'var(--color-bone)',
        whiteSpace:'nowrap',zIndex:999,
        transition:'transform .45s cubic-bezier(.34,1.56,.64,1)',
        boxShadow:'4px 4px 0 var(--color-blood), 0 8px 40px rgba(0,0,0,.7)',
      }}>
        ✂️ Appointment confirmed — don't be late
      </div>
    </section>
  )
}
