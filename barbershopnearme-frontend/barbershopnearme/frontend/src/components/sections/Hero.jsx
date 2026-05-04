import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'
import RubberHoseButton from '@/components/ui/RubberHoseButton.jsx'
import { useNavigate } from 'react-router-dom'

/* ── Inline rubber hose SVG decorations ── */

function ScissorsDeco(){
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" fill="none"
      style={{ animation:'floatBob 3.2s ease-in-out infinite', filter:'drop-shadow(3px 3px 0 #8B1A1A)' }}>
      {/* rings */}
      <circle cx="16" cy="16" r="11" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="16" r="5"  fill="#8B1A1A"/>
      <circle cx="16" cy="62" r="11" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="62" r="5"  fill="#8B1A1A"/>
      {/* blades */}
      <path d="M25 23 L70 68" stroke="#E8DFC8" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M25 55 L70 10" stroke="#E8DFC8" strokeWidth="4.5" strokeLinecap="round"/>
      {/* pivot gem */}
      <circle cx="47" cy="39" r="5.5" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2.5"/>
      <circle cx="45" cy="37" r="2"   fill="rgba(255,255,240,.5)"/>
    </svg>
  )
}

function RazorSVG(){
  return (
    <svg width="100" height="28" viewBox="0 0 100 28" fill="none"
      style={{ animation:'floatBobReverse 4s ease-in-out .8s infinite' }}>
      {/* handle */}
      <rect x="0" y="8" width="32" height="12" rx="4" fill="#1a1410" stroke="#E8DFC8" strokeWidth="2"/>
      <rect x="4" y="11" width="24" height="6" rx="2" fill="rgba(232,223,200,.12)"/>
      {/* blade */}
      <path d="M32 4 L82 14 L32 24 L36 14 Z" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2"/>
      <path d="M40 10 L76 14 L40 18" stroke="rgba(255,255,240,.35)" strokeWidth="1.5" fill="none"/>
      {/* blade tip */}
      <path d="M82 14 L100 14" stroke="#E8DFC8" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function StarDivider(){
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, width:'100%' }}>
      <div style={{ flex:1, height:1, background:'rgba(232,223,200,.18)' }}/>
      {[0,1,2].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10"
          style={{ animation:`starSpin ${2.5+i*.5}s linear ${i*.4}s infinite`, flexShrink:0 }}>
          <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8.1,9 5,7 1.9,9 3,5.7 0,3.5 3.8,3.5"
            fill={i===1?'#8B1A1A':'#E8DFC8'}/>
        </svg>
      ))}
      <div style={{ flex:1, height:1, background:'rgba(232,223,200,.18)' }}/>
    </div>
  )
}

function InkSplatDeco({ size=60, rotate=0, opacity=0.06 }){
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none"
      style={{ position:'absolute', pointerEvents:'none', transform:`rotate(${rotate}deg)`, opacity }}>
      <path d="M30 4 C36 2 42 8 44 14 C50 10 56 16 54 22 C60 24 60 32 54 34 C58 40 54 48 48 48 C50 54 44 58 38 54 C36 60 28 60 26 54 C20 58 14 54 16 48 C10 48 6 40 10 34 C4 32 4 24 10 22 C8 16 14 10 20 14 C22 8 26 2 30 4Z"
        fill="#8B1A1A"/>
    </svg>
  )
}

export default function Hero({ onBookNow }) {
  const navigate = useNavigate()
  const ref = useRef()
  useReveal(ref)
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  return (
    <section className="hero-section" ref={ref}>
      {/* floating ink splatters — pure decoration */}
      <InkSplatDeco size={180} rotate={12}  opacity={0.04} style={{ position:'absolute', top:'8%',  right:'2%' }}/>
      <InkSplatDeco size={120} rotate={-20} opacity={0.03} style={{ position:'absolute', bottom:'15%', left:'3%' }}/>

      <div className="container hero-inner">

        {/* top rule with location tag */}
        <div className="hero-rule-row reveal">
          <div className="h-rule"/>
          <span className="t-label" style={{ whiteSpace:'nowrap', color:'var(--color-blood)' }}>
            ✂ Est. 1931 · Hattiesburg, MS ✂
          </span>
          <div className="h-rule"/>
        </div>

        {/* headline + deco */}
        <div className="hero-main">
          <div>
            {/* eyebrow */}
            <div className="reveal" style={{
              fontFamily:'var(--font-rubber)', fontSize:14, letterSpacing:'.2em',
              textTransform:'uppercase', color:'var(--color-blood)',
              marginBottom:16, transitionDelay:'.02s',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ width:32, height:2, background:'var(--color-blood)', display:'inline-block', borderRadius:2, flexShrink:0 }}/>
              The Finest Blade in the South
              <span style={{ width:32, height:2, background:'var(--color-blood)', display:'inline-block', borderRadius:2, flexShrink:0 }}/>
            </div>

            <h1 className="t-display reveal" style={{ transitionDelay:'.06s' }}>
              The City's
              <span style={{
                color:'var(--color-blood)', display:'block',
                animation:'titleWobble 5s ease-in-out infinite',
                textShadow:'4px 4px 0 rgba(139,26,26,.3)',
              }}>
                Sharpest
              </span>
              Blade.
            </h1>

            <div className="reveal" style={{
              marginTop:28, maxWidth:400, transitionDelay:'.14s',
              fontFamily:'var(--font-body)', fontSize:13, lineHeight:2,
              color:'var(--color-dim-1)', letterSpacing:'.04em',
            }}>
              Cold blade. Hot towel. Old-school craft, new-school energy.
              Walk in rough — walk out looking like a verdict.
            </div>

            {/* rubber hose badge tags */}
            <div className="reveal" style={{
              display:'flex', gap:10, flexWrap:'wrap', marginTop:24,
              transitionDelay:'.18s',
            }}>
              {['✂ Hot Towel Finish','💈 Since 1931','⚡ Walk-Ins Welcome'].map((tag,i) => (
                <span key={tag} style={{
                  fontFamily:'var(--font-rubber)', fontSize:12, letterSpacing:'.1em',
                  textTransform:'uppercase', color:'var(--color-dim-1)',
                  border:'2px solid rgba(232,223,200,.16)',
                  borderRadius:'var(--rh-pill)',
                  padding:'5px 14px',
                  background:'rgba(232,223,200,.04)',
                  animation:`floatBob ${3+i*.5}s ease-in-out ${i*.4}s infinite`,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* decorative side column */}
          <div className="hero-deco reveal" style={{ transitionDelay:'.1s', gap:20 }}>
            {/* animated barber pole */}
            <div className="hero-deco-pole">
              <div className="hero-deco-pole-inner"/>
            </div>
            {/* scissors */}
            <ScissorsDeco/>
            {/* razor */}
            <RazorSVG/>
            {/* star divider */}
            <StarDivider/>
            {/* tag */}
            <div className="hero-deco-tag">
              Cold blade<br/>Hot towel<br/>No excuses<br/>No mercy
            </div>
          </div>
        </div>

        {/* stats + CTAs */}
        <div className="hero-bottom-row">
          <div className="hero-stats">
            {[
              ['93','Years Open'],
              ['3', 'Barbers'],
              ['0', 'Bad Cuts'],
            ].map(([n,l],i) => (
              <div key={l} className="hero-stat reveal" style={{ transitionDelay:`${.2+i*.08}s` }}>
                <span className="t-stat" style={{
                  animation:`wobble ${4+i}s ease-in-out ${i*.5}s infinite`,
                  display:'inline-block',
                }}>{n}</span>
                <span className="t-label" style={{ marginTop:4 }}>{l}</span>
              </div>
            ))}
          </div>

          <div className="hero-btns reveal" style={{ transitionDelay:'.28s' }}>
            <RubberHoseButton variant="primary" splat="LET'S GO!" onClick={onBookNow}>
              ✂ Book a Cut
            </RubberHoseButton>
            <RubberHoseButton variant="ghost" splat="NICE!" onClick={() => go('services')}>
              Services
            </RubberHoseButton>
            <RubberHoseButton variant="ghost" onClick={() => navigate('/barber-login')}
              style={{ fontSize:13, padding:'11px 22px', letterSpacing:'.1em',
                borderColor:'rgba(139,26,26,.55)', color:'rgba(232,223,200,.75)',
                boxShadow:'3px 3px 0 rgba(139,26,26,.3)' }}>
              ✂ Barber Login
            </RubberHoseButton>
          </div>
        </div>

      </div>
    </section>
  )
}
