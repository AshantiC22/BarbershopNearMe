import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const SERVICES = [
  { n:'01', name:'The Classic',    desc:'Precision fade. No drama. Clean as a verdict.',      price:'$28', icon:'✂️' },
  { n:'02', name:'Straight Shave', desc:'Hot towel, straight blade. Ritual, not routine.',    price:'$35', icon:'🪒' },
  { n:'03', name:'Full Service',   desc:'Cut and shave in one sitting. Walk out new.',         price:'$55', icon:'💈' },
  { n:'04', name:'Beard Line',     desc:'Geometry for your jaw. Sharp borders, clean angles.', price:'$22', icon:'⚡' },
]

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
        </div>

        <div className="section-intro">
          <h2 className="t-title reveal" style={{ transitionDelay:'.06s' }}>
            The Menu<br/>of Damage
          </h2>
          <p className="t-body reveal" style={{ maxWidth:260, transitionDelay:'.1s' }}>
            Every cut includes a hot towel finish.<br/>
            Cash preferred. Attitude mandatory.
          </p>
        </div>

        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <div key={s.n} className="svc-card reveal" style={{ transitionDelay:`${i*.08}s` }}>
              {/* large ghost number */}
              <div className="svc-card-ghost">{s.n}</div>

              <span className="svc-card-num">{s.n}</span>

              {/* icon */}
              <div style={{
                fontSize:28, marginBottom:16,
                animation:`floatBob ${2.5+i*.4}s ease-in-out infinite`,
                animationDelay:`${i*.3}s`,
              }}>
                {s.icon}
              </div>

              <div className="svc-card-name">{s.name}</div>
              <p className="t-body" style={{ fontSize:12, flexGrow:1 }}>{s.desc}</p>

              <div className="svc-card-footer">
                <span className="t-price">{s.price}</span>
                <span className="t-label">From</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
