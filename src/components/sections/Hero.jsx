import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useReveal from '@/hooks/useReveal.js'
import RubberHoseButton from '@/components/ui/RubberHoseButton.jsx'
import BookNowTransition from '@/components/ui/BookNowTransition.jsx'

function ScissorsSVG() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
      style={{ animation:'floatBob 3s ease-in-out infinite' }}>
      <circle cx="16" cy="16" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="56" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <line x1="24" y1="22" x2="66" y2="64" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="66" y2="8"  stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="4" fill="#8B1A1A"/>
      <circle cx="16" cy="56" r="4" fill="#8B1A1A"/>
      <circle cx="45" cy="36" r="4.5" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2"/>
    </svg>
  )
}

function RazorDivider() {
  return (
    <svg width="140" height="16" viewBox="0 0 140 16" fill="none">
      <line x1="0" y1="8" x2="52" y2="8" stroke="#E8DFC8" strokeWidth="1" opacity=".25"/>
      <polygon points="60,2 80,8 60,14 66,8" fill="#8B1A1A"/>
      <line x1="88" y1="8" x2="140" y2="8" stroke="#E8DFC8" strokeWidth="1" opacity=".25"/>
    </svg>
  )
}

export default function Hero() {
  const ref = useRef()
  useReveal(ref)
  const navigate = useNavigate()
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  /* show the portal transition animation before navigating to login */
  const [showTransition, setShowTransition] = useState(false)

  if (showTransition)
    return <BookNowTransition onDone={() => navigate('/login')} />

  return (
    <section className="hero-section" ref={ref}>
      <div className="container hero-inner">

        <div className="hero-rule-row reveal">
          <div className="h-rule"/>
          <span className="t-label" style={{ whiteSpace:'nowrap' }}>Est. 1931 · Hattiesburg, MS</span>
          <div className="h-rule"/>
        </div>

        <div className="hero-main">
          <div>
            <h1 className="t-display reveal" style={{ transitionDelay:'.06s' }}>
              The City's
              <span style={{ color:'var(--color-blood)', display:'block', animation:'titleWobble 5s ease-in-out infinite' }}>
                Sharpest
              </span>
              Blade.
            </h1>
            <div className="reveal" style={{
              marginTop:32, maxWidth:420, transitionDelay:'.14s',
              fontFamily:'var(--font-body)', fontSize:13, lineHeight:1.9,
              color:'var(--color-dim-1)', letterSpacing:'.03em',
            }}>
              Cold blade. Hot towel. Old-school craft, new-school energy.
              Walk in rough — walk out looking like a verdict.
            </div>
          </div>

          <div className="hero-deco reveal" style={{ transitionDelay:'.1s' }}>
            <div className="hero-deco-pole">
              <div className="hero-deco-pole-inner"/>
            </div>
            <ScissorsSVG/>
            <RazorDivider/>
            <div className="hero-deco-tag">
              Cold blade<br/>Hot towel<br/>No mercy
            </div>
          </div>
        </div>

        <div className="hero-bottom-row">
          <div className="hero-stats">
            {[['93','Years Open'],['3','Barbers'],['0','Bad Cuts']].map(([n,l],i) => (
              <div key={l} className="hero-stat reveal" style={{ transitionDelay:`${.2+i*.08}s` }}>
                <span className="t-stat">{n}</span>
                <span className="t-label" style={{ marginTop:6 }}>{l}</span>
              </div>
            ))}
          </div>

          <div className="hero-btns reveal" style={{ transitionDelay:'.26s' }}>
            {/* Book a Cut → plays PortalTransition → then goes to /login */}
            <RubberHoseButton
              variant="primary"
              splat="LET'S GO!"
              onClick={() => setShowTransition(true)}
            >
              ✂ Book a Cut
            </RubberHoseButton>
            <RubberHoseButton
              variant="ghost"
              splat="NICE!"
              onClick={() => go('services')}
            >
              Services
            </RubberHoseButton>
          </div>
        </div>

      </div>
    </section>
  )
}
