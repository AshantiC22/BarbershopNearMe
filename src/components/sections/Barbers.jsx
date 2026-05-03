import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const BARBERS = [
  {
    initials:'MJ', name:'Marcus Jones', role:'Head Blade',
    spec:'Fades & Tapers', g:'I', years:'12 yrs',
    quote:'"No mercy. No bad cuts."',
  },
  {
    initials:'TA', name:'Terrence Ace', role:'The Closer',
    spec:'Hot Shaves', g:'II', years:'8 yrs',
    quote:'"Cold blade. Warm towel."',
  },
  {
    initials:'LP', name:'Lena Pham', role:'The Architect',
    spec:'Creative Cuts', g:'III', years:'6 yrs',
    quote:'"Every line tells a story."',
  },
]

/* Inline SVG barber badge illustrations */
function BarberBadge({ initials }) {
  return (
    <div className="barber-badge">
      <span>{initials}</span>
    </div>
  )
}

export default function Barbers() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section id="barbers" className="section" ref={ref}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">02</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">The Crew</span>
        </div>

        <div className="section-intro">
          <h2 className="t-title reveal" style={{ transitionDelay:'.06s' }}>
            Three Blades.<br/>No Backup.
          </h2>
          <p className="t-body reveal" style={{ maxWidth:260, transitionDelay:'.1s' }}>
            Trained in the old ways.<br/>
            Licensed by the state.<br/>
            Answerable to no one else.
          </p>
        </div>

        <div className="barber-grid">
          {BARBERS.map((b, i) => (
            <div key={b.initials} className="barber-card reveal" style={{ transitionDelay:`${i*.09}s` }}>

              {/* ghost numeral */}
              <div className="barber-ghost">{b.g}</div>

              {/* badge */}
              <BarberBadge initials={b.initials}/>

              <div className="barber-name">{b.name}</div>
              <div className="t-label" style={{ marginBottom:8 }}>{b.role}</div>

              {/* years */}
              <div style={{
                fontFamily:'var(--font-display)',fontSize:13,
                color:'var(--color-dim-1)',letterSpacing:'.1em',
                marginBottom:12,
              }}>
                {b.years} experience
              </div>

              {/* quote */}
              <div style={{
                fontFamily:'var(--font-body)',fontSize:11,fontStyle:'italic',
                color:'var(--color-dim-1)',
                borderLeft:'2px solid var(--color-blood)',
                paddingLeft:12,marginBottom:16,
                lineHeight:1.6,
              }}>
                {b.quote}
              </div>

              <span className="barber-spec">{b.spec}</span>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
