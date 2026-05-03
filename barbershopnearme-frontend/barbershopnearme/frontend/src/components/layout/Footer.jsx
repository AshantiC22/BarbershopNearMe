import { Link } from 'react-router-dom'

export default function Footer() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })

  return (
    <footer className="footer">
      <div className="container">
        {/* top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:32, marginBottom:40, paddingBottom:40, borderBottom:'2px solid rgba(232,223,200,.1)' }}>

          {/* brand */}
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:20, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--color-bone)', marginBottom:8 }}>
              Barbershopnearme
            </div>
            <div style={{ fontFamily:"var(--font-body)", fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--color-dim-1)', lineHeight:2 }}>
              Est. 1931 · Hattiesburg, MS<br/>
              The City's Sharpest Blade
            </div>
          </div>

          {/* nav links */}
          <div style={{ display:'flex', gap:48, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontFamily:"var(--font-body)", fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--color-blood)', marginBottom:14 }}>Services</div>
              {['Services','Barbers','Gallery','Reviews','Location'].map(s => (
                <button key={s} onClick={() => go(s.toLowerCase())} style={{ display:'block', fontFamily:"var(--font-rubber)", fontSize:13, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--color-dim-1)', background:'none', border:'none', cursor:'pointer', padding:'4px 0', transition:'color .2s' }}
                  onMouseEnter={e=>e.target.style.color='var(--color-bone)'}
                  onMouseLeave={e=>e.target.style.color='var(--color-dim-1)'}
                >{s}</button>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-body)", fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:'var(--color-blood)', marginBottom:14 }}>Account</div>
              {[['Book a Cut','/login'],['My Dashboard','/dashboard'],['Newsletter','/newsletter'],['Terms','/terms']].map(([label,path]) => (
                <Link key={label} to={path} style={{ display:'block', fontFamily:"var(--font-rubber)", fontSize:13, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--color-dim-1)', textDecoration:'none', padding:'4px 0', transition:'color .2s' }}
                  onMouseEnter={e=>e.target.style.color='var(--color-bone)'}
                  onMouseLeave={e=>e.target.style.color='var(--color-dim-1)'}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div className="footer-inner">
          <span className="footer-mark">✂ Barbershopnearme</span>
          <div className="footer-info">
            123 Noir Alley · Hattiesburg, MS 39401<br/>
            Mon–Fri 9am–6pm · Sat 9am–4pm · Sun Closed<br/>
            (601) 555-0199 · © {new Date().getFullYear()} All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  )
}
