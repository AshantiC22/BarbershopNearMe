import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api.js'

/* ── fallback placeholders shown when no real barbers exist ── */
const FALLBACK = [
  { id:'f1', initials:'MJ', name:'Marcus Jones', role:'Head Blade',    spec:'Fades & Tapers', years:'12', quote:'"No mercy. No bad cuts."',      ghost:'I'   },
  { id:'f2', initials:'TA', name:'Terrence Ace', role:'The Closer',    spec:'Hot Shaves',      years:'8',  quote:'"Cold blade. Warm towel."',    ghost:'II'  },
  { id:'f3', initials:'LP', name:'Lena Pham',    role:'The Architect', spec:'Creative Cuts',   years:'6',  quote:'"Every line tells a story."',  ghost:'III' },
]

const GHOSTS = ['I','II','III','IV','V','VI']

/* rubber hose scissors watermark */
function CardScissors({ delay }){
  return (
    <svg width="28" height="28" viewBox="0 0 72 72" fill="none"
      style={{ position:'absolute', top:18, right:18, opacity:.15, pointerEvents:'none',
        animation:`floatBob 3.5s ease-in-out ${delay}s infinite` }}>
      <circle cx="16" cy="16" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="none"/>
      <circle cx="16" cy="56" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="none"/>
      <line x1="24" y1="22" x2="66" y2="64" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="66" y2="8"  stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )
}

/* single barber card */
function BarberCard({ barber, index, isFallback, onSelect }){
  const [imgErr, setImgErr] = useState(false)
  const photoSrc = barber.photo_url || barber.photo_data || null
  const hasPhoto = !isFallback && !!photoSrc && !imgErr

  const initials = barber.name
    ? barber.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <div
      className="barber-card"
      style={{
        transitionDelay:`${index * .1}s`,
        cursor: isFallback ? 'default' : 'pointer',
        animation:`barberFadeUp .5s cubic-bezier(.16,1,.3,1) ${index * .1}s both`,
      }}
      onClick={() => !isFallback && onSelect && onSelect(barber)}
      role={isFallback ? undefined : 'button'}
      tabIndex={isFallback ? undefined : 0}
      onKeyDown={e => !isFallback && e.key==='Enter' && onSelect && onSelect(barber)}
    >

      <div className="barber-ghost">{GHOSTS[index] || 'I'}</div>
      <CardScissors delay={index * .5}/>

      {/* photo badge — reuse .barber-badge styling, swap inner content */}
      <div className="barber-badge" style={{ overflow:'hidden' }}>
        {hasPhoto ? (
          <img
            src={photoSrc}
            alt={barber.name}
            onError={() => setImgErr(true)}
            style={{
              width:'100%', height:'100%',
              objectFit:'cover', objectPosition:'center top',
              display:'block', position:'relative', zIndex:1,
              borderRadius:'inherit',
            }}
          />
        ) : (
          <span>{isFallback ? barber.initials : initials}</span>
        )}
      </div>

      {/* name */}
      <div className="barber-name">{barber.name}</div>

      {/* role */}
      <div style={{
        fontFamily:'var(--font-rubber)', fontSize:12, letterSpacing:'.14em',
        textTransform:'uppercase', color:'var(--color-blood)', marginBottom:4,
      }}>
        {isFallback ? barber.role : 'Licensed Barber'}
      </div>

      {/* years / bio */}
      {isFallback ? (
        <div style={{
          fontFamily:'var(--font-display)', fontSize:12,
          color:'var(--color-dim-1)', letterSpacing:'.1em', marginBottom:14,
        }}>
          {barber.years} years experience
        </div>
      ) : barber.bio ? (
        <div style={{
          fontFamily:'var(--font-body)', fontSize:12,
          color:'var(--color-dim-1)', letterSpacing:'.04em',
          marginBottom:14, lineHeight:1.6,
        }}>
          {barber.bio.length > 80 ? barber.bio.slice(0, 80) + '…' : barber.bio}
        </div>
      ) : (
        <div style={{ marginBottom:14 }}/>
      )}

      {/* quote (fallback) or accepting-clients dot (live) */}
      {isFallback ? (
        <div style={{
          fontFamily:'var(--font-body)', fontSize:12, fontStyle:'italic',
          color:'var(--color-dim-1)',
          borderLeft:'3px solid var(--color-blood)',
          padding:'8px 8px 8px 14px', marginBottom:16, lineHeight:1.7,
          background:'rgba(139,26,26,.05)',
          borderRadius:'0 var(--rh-1)',
        }}>
          {barber.quote}
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
          <div style={{
            width:7, height:7, borderRadius:'50%', background:'#22c55e',
            boxShadow:'0 0 6px rgba(34,197,94,.8)', flexShrink:0,
          }}/>
          <span style={{
            fontFamily:'var(--font-body)', fontSize:13,
            color:'rgba(74,222,128,.8)', letterSpacing:'.15em', textTransform:'uppercase',
          }}>
            Accepting Clients
          </span>
        </div>
      )}

      {/* spec pill */}
      <span className="barber-spec">
        {isFallback ? barber.spec : 'Book Now →'}
      </span>

    </div>
  )
}

export default function Barbers() {
  const ref      = useRef()
  const navigate = useNavigate()

  /* read auth from localStorage directly — avoids needing AuthContext here */
  const isLoggedIn = () => !!localStorage.getItem('bsnm_token')

  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)

  const handleSelectBarber = (barber) => {
    if (!isLoggedIn()) {
      /* Not logged in — go to login, then come back to portal with barber pre-selected */
      navigate('/login', { state: { returnTo: '/portal', barber } })
    } else {
      /* Logged in — go straight to portal with barber pre-selected */
      navigate('/portal', { state: { barber } })
    }
  }

  useEffect(() => {
    // Cache-bust so service worker never serves stale barber data
    api.get('barbers/', { params: { _t: Date.now() } })
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || []
        setBarbers(list)
      })
      .catch(() => setBarbers([]))
      .finally(() => setLoading(false))
  }, [])

  /* After data loads, force all reveal elements visible.
     On mobile the section is already in viewport so IntersectionObserver
     may have already fired and disconnected — just add .in directly. */
  useEffect(() => {
    if (loading) return
    // Small delay to let React render the cards first
    const t = setTimeout(() => {
      if (!ref.current) return
      ref.current.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => {
          requestAnimationFrame(() => el.classList.add('in'))
        }, i * 60)
      })
    }, 50)
    return () => clearTimeout(t)
  }, [loading])

  const showLive     = !loading && barbers.length > 0
  const showFallback = !loading && barbers.length === 0
  const cards        = showLive ? barbers : FALLBACK

  const headlineNum = showLive
    ? ['One','Two','Three','Four','Five','Six'][barbers.length - 1] || `${barbers.length}`
    : 'Three'

  return (
    <section id="barbers" className="section" ref={ref}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">02</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">The Crew</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.18)' }}/>
        </div>

        <div className="section-intro">
          <h2 className="t-title reveal" style={{ transitionDelay:'.06s' }}>
            {headlineNum} Blade{showLive && barbers.length === 1 ? '.' : 's.'}<br/>
            <span style={{ color:'var(--color-blood)' }}>
              {showLive && barbers.length === 1 ? 'No Backup.' : 'No Backups.'}
            </span>
          </h2>
          <p className="t-body reveal" style={{ maxWidth:280, transitionDelay:'.1s' }}>
            Trained in the old ways.<br/>
            Licensed by the state.<br/>
            Answerable to no one else.
          </p>
        </div>

        {/* loading skeleton */}
        {loading && (
          <div className="barber-grid">
            {[0,1,2].map(i => (
              <div key={i} className="barber-card" style={{
                background:'linear-gradient(90deg,rgba(232,223,200,.02) 25%,rgba(232,223,200,.14) 50%,rgba(232,223,200,.02) 75%)',
                backgroundSize:'200% 100%',
                animation:'shimmer 1.5s infinite',
                minHeight:300,
              }}/>
            ))}
          </div>
        )}

        {/* cards */}
        {!loading && (
          <div className="barber-grid">
            {cards.map((b, i) => (
              <BarberCard
                key={b.id}
                barber={b}
                index={i}
                isFallback={showFallback}
                onSelect={showLive ? handleSelectBarber : undefined}
              />
            ))}
          </div>
        )}

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes barberFadeUp {
          from { opacity:0; transform:translate3d(0,20px,0) scale(.97); }
          to   { opacity:1; transform:translate3d(0,0,0) scale(1); }
        }
      `}</style>
    </section>
  )
}
