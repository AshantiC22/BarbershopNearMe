import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const SERVICES = [
  {
    n:'01', name:'The Classic', price:'$28',
    desc:'Precision fade. No drama. Clean as a verdict.',
    icon:'✂️', flavor:'30 min', badge:'Most Popular',
  },
  {
    n:'02', name:'Straight Shave', price:'$35',
    desc:'Hot towel, straight blade. Ritual, not routine.',
    icon:'🪒', flavor:'45 min', badge:'Signature',
  },
  {
    n:'03', name:'Full Service', price:'$55',
    desc:'Cut and shave in one sitting. Walk out brand new.',
    icon:'💈', flavor:'60 min', badge:'Best Value',
  },
  {
    n:'04', name:'Beard Line', price:'$22',
    desc:'Geometry for your jaw. Sharp borders, clean angles.',
    icon:'⚡', flavor:'20 min', badge:'Quick Hit',
  },
]

/* rubber hose section divider SVG */
function SectionDivider(){
  return (
    <svg width="100%" height="20" viewBox="0 0 400 20" preserveAspectRatio="none" fill="none"
      style={{ display:'block', margin:'0 0 64px' }}>
      <path d="M0 10 C40 4, 80 16, 120 10 C160 4, 200 16, 240 10 C280 4, 320 16, 360 10 C380 6, 390 12, 400 10"
        stroke="rgba(232,223,200,.28)" strokeWidth="2" fill="none"/>
    </svg>
  )
}

export default function Services() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section id="services" className="section" ref={ref}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">01</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Services</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.18)' }}/>
        </div>

        <div className="section-intro">
          <h2 className="t-title reveal" style={{ transitionDelay:'.06s' }}>
            The Menu<br/>
            <span style={{ color:'var(--color-blood)' }}>of Damage</span>
          </h2>
          <div className="reveal" style={{ maxWidth:280, transitionDelay:'.1s' }}>
            <p className="t-body">
              Every cut includes a hot towel finish.<br/>
              Cash preferred. Attitude mandatory.
            </p>
            {/* rubber hose star rating */}
            <div style={{ display:'flex', gap:6, marginTop:12 }}>
              {[0,1,2,3,4].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14"
                  style={{ animation:`starSpin ${3+i*.3}s linear ${i*.2}s infinite` }}>
                  <polygon points="7,0 8.7,5 14,5 9.8,8 11.4,13 7,10 2.6,13 4.2,8 0,5 5.3,5"
                    fill={i<4?'#8B1A1A':'rgba(139,26,26,.3)'}/>
                </svg>
              ))}
              <span style={{ fontFamily:'var(--font-body)', fontSize:12, letterSpacing:'.2em', color:'var(--color-dim-1)', marginLeft:6 }}>
                RATED #1
              </span>
            </div>
          </div>
        </div>

        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div key={s.n} className="svc-card reveal" style={{ transitionDelay:`${i*.08}s` }}>
              <div className="svc-card-ghost">{s.n}</div>
              <span className="svc-card-num">{s.n}</span>

              {/* rubber hose icon bubble */}
              <div className="svc-card-icon">
                {s.icon}
              </div>

              {/* badge pill */}
              <div style={{
                display:'inline-block',
                fontFamily:'var(--font-rubber)', fontSize:12, letterSpacing:'.12em',
                textTransform:'uppercase', color:'var(--color-blood)',
                border:'2px solid rgba(139,26,26,.3)',
                borderRadius:'var(--rh-pill)',
                padding:'3px 12px', marginBottom:10,
                background:'rgba(139,26,26,.08)',
              }}>
                {s.badge}
              </div>

              <div className="svc-card-name">{s.name}</div>
              <p className="t-body" style={{ fontSize:12, flexGrow:1, marginBottom:12 }}>
                {s.desc}
              </p>

              <div className="svc-card-footer">
                <span className="t-price">{s.price}</span>
                <span style={{
                  fontFamily:'var(--font-rubber)', fontSize:13, letterSpacing:'.1em',
                  color:'var(--color-dim-1)',
                }}>
                  {s.flavor}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
