import { useState, useEffect, useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'
import api from '@/services/api.js'

const FALLBACK = [
  { label:'Precision Fade',  sub:'Signature cut',  num:'01', id:'f1', photo_data:null },
  { label:'Clean Lineup',    sub:'Sharp edges',     num:'02', id:'f2', photo_data:null },
  { label:'Beard Trim',      sub:'Sculpted look',   num:'03', id:'f3', photo_data:null },
  { label:'Kids Cutz',       sub:'Ages 1–12',       num:'04', id:'f4', photo_data:null },
  { label:'Full Experience', sub:'Cut and shave',   num:'05', id:'f5', photo_data:null },
  { label:'The Chair',       sub:'Your throne',     num:'06', id:'f6', photo_data:null },
]

const T = {
  ink:'#070504', ink2:'#0F0B09', bone:'#E8DFC8',
  blood:'#8B1A1A', dim1:'rgba(232,223,200,.75)', dim2:'rgba(232,223,200,.22)',
}
const RH = [
  '14px 8px 12px 10px/10px 12px 8px 14px',
  '8px 14px 10px 12px/12px 8px 14px 10px',
  '12px 10px 14px 8px/8px 14px 10px 12px',
  '10px 12px 8px 14px/14px 10px 12px 8px',
]

export default function Gallery() {
  const ref = useRef()
  useReveal(ref)

  const [items,   setItems]   = useState([])
  const [active,  setActive]  = useState(0)
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use barbersnearme.xyz — Railway verified domain works on all devices
    const url = `https://barbersnearme.xyz/api/gallery/?_t=${Date.now()}`
    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d.results || []
        setItems(list.length > 0 ? list : FALLBACK)
        setActive(0)
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false))
  }, [])

  // Re-trigger reveals after loading
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      ref.current?.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => requestAnimationFrame(() => el.classList.add('in')), i * 60)
      })
    }, 50)
    return () => clearTimeout(t)
  }, [loading])

  const img = items[active] || items[0]
  const hasPhoto = !!img?.photo_data

  return (
    <section className="section" ref={ref} style={{ overflow:'hidden' }}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">04</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Gallery</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.08)' }}/>
        </div>

        <div className="section-intro">
          <h2 className="t-title reveal" style={{ transitionDelay:'.06s' }}>
            The Work<br/>
            <span style={{ color:'var(--color-blood)' }}>Speaks</span>
          </h2>
          <p className="t-body reveal" style={{ maxWidth:260, transitionDelay:'.1s' }}>
            Every cut is a statement.<br/>
            Every line is intentional.<br/>
            No bad cuts. Not once.
          </p>
        </div>

        {/* main grid */}
        <div className="reveal" style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:24, marginBottom:20,
        }}>

          {/* big main image */}
          <div style={{
            position:'relative', paddingTop:'120%', overflow:'hidden',
            borderRadius:'var(--rh-1)', border:`3px solid ${T.dim2}`,
            boxShadow:`6px 6px 0 rgba(139,26,26,.2)`,
            background: T.ink2,
            transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.01) rotate(-.3deg)'}
            onMouseLeave={e=>e.currentTarget.style.transform='none'}
          >
            {/* placeholder number */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:80,
                color:'rgba(232,223,200,.06)', letterSpacing:'-.04em' }}>
                {img?.num || '01'}
              </span>
            </div>

            {/* real photo */}
            {hasPhoto && (
              <img
                src={img.photo_data}
                alt={img.label}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                  objectFit:'cover', objectPosition:'center top', display:'block' }}
              />
            )}

            {/* overlay */}
            <div style={{ position:'absolute', inset:0,
              background:'linear-gradient(to top, rgba(7,5,4,.85) 0%, transparent 60%)' }}/>

            {/* label */}
            <div style={{ position:'absolute', bottom:20, left:20, right:20 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26,
                color:T.bone, lineHeight:1, marginBottom:4 }}>
                {img?.label}
              </div>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:11,
                letterSpacing:'.25em', textTransform:'uppercase', color:T.dim1 }}>
                {img?.sub}
              </div>
            </div>

            <div style={{ position:'absolute', top:16, right:16,
              fontFamily:"'Bebas Neue',sans-serif", fontSize:11,
              color:T.blood, letterSpacing:'.2em' }}>
              {img?.num}
            </div>
          </div>

          {/* thumbnails */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {items.map((g, i) => (
              <div key={g.id || g.num || i}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position:'relative', paddingTop:'120%', overflow:'hidden',
                  borderRadius: RH[i % 4],
                  border:`3px solid ${active===i ? T.blood : T.dim2}`,
                  cursor:'pointer', background: T.ink2,
                  transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
                  transform: active===i ? 'scale(1.04) rotate(-.5deg)'
                           : hovered===i ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: active===i ? `4px 4px 0 ${T.blood}` : 'none',
                  filter: active===i ? 'none' : 'brightness(.55)',
                }}
              >
                <div style={{ position:'absolute', inset:0,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",
                    fontSize:28, color:'rgba(232,223,200,.08)' }}>{g.num}</span>
                </div>

                {g.photo_data && (
                  <img src={g.photo_data} alt={g.label}
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center top', display:'block' }}
                  />
                )}

                {active===i && (
                  <div style={{ position:'absolute', bottom:0, left:0, right:0,
                    height:3, background:T.blood }}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* dot indicators */}
        <div style={{ display:'flex', gap:8, justifyContent:'center',
          alignItems:'center', marginTop:16 }}>
          {items.map((_,i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: active===i ? 28 : 8, height:4, padding:0,
              background: active===i ? T.blood : T.dim2,
              border: active===i ? `1px solid ${T.bone}` : 'none',
              borderRadius:4, cursor:'pointer',
              transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
            }}/>
          ))}
        </div>

      </div>
    </section>
  )
}
