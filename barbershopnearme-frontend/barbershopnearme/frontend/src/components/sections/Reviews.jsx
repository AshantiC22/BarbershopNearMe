import { useState, useEffect, useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'
import api from '@/services/api.js'

/* Fallback static reviews if backend returns none */
const STATIC = [
  { q:'This man is an amazing barber with great energy and personality. Most importantly the cuts are fire!! Go book with him.', name:'Ronnie E.',   city:'Hattiesburg', rating:5 },
  { q:'Best fade in Hattiesburg, hands down. I drive 40 minutes just to sit in that chair. Worth every mile.',                  name:'Marcus T.',   city:'Laurel',       rating:5 },
  { q:'Came in first time, walked out looking like a new man. The lineup was immaculate. Already booked my next one.',          name:'DeShawn K.', city:'Hattiesburg', rating:5 },
  { q:'My son has been going here since he was 3. Fantastic with kids and the cut is always perfect.',                          name:'Tanya W.',    city:'Hattiesburg', rating:5 },
]

const T = {
  ink:'#070504', ink2:'#0F0B09',
  bone:'#E8DFC8', blood:'#8B1A1A',
  gold:'#C8A840',
  dim1:'rgba(232,223,200,.55)', dim2:'rgba(232,223,200,.14)', dim3:'rgba(232,223,200,.06)',
}

function StarRow({ rating=5 }){
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 14 14">
          <polygon points="7,0 8.7,5 14,5 9.8,8 11.4,13 7,10 2.6,13 4.2,8 0,5 5.3,5"
            fill={s<=rating ? T.gold : 'rgba(200,168,64,.2)'}/>
        </svg>
      ))}
    </div>
  )
}

export default function Reviews() {
  const ref = useRef()
  useReveal(ref)
  const [reviews, setReviews] = useState(STATIC)
  const [idx,     setIdx]     = useState(0)
  const [paused,  setPaused]  = useState(false)

  useEffect(() => {
    api.get('/reviews/?approved=true&limit=8').then(d => {
      const items = Array.isArray(d) ? d : d.results || []
      if (items.length > 0) setReviews(items.map(r => ({
        q:    r.comment || r.review_text || r.text || '',
        name: r.client_name || r.name || 'Client',
        city: r.city || 'Hattiesburg',
        rating: r.rating || 5,
      })))
    }).catch(() => {/* use static */})
  }, [])

  /* auto-advance */
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIdx(i => (i+1) % reviews.length), 6500)
    return () => clearInterval(t)
  }, [reviews.length, paused])

  const rv = reviews[idx]

  return (
    <section className="section" ref={ref} style={{ background:'rgba(232,223,200,.015)' }}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">05</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Reviews</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.08)' }}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

          {/* left — heading */}
          <div className="reveal">
            <h2 className="t-title" style={{ marginBottom:16 }}>
              Word of<br/>
              <span style={{ color:'var(--color-blood)' }}>Mouth.</span>
            </h2>
            <p className="t-body" style={{ marginBottom:28 }}>
              Real clients. Real results.<br/>No fluff.
            </p>

            {/* dot controls */}
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {reviews.map((_,i) => (
                <button key={i} onClick={() => { setIdx(i); setPaused(true) }} style={{
                  width: idx===i ? 26 : 7, height:4, padding:0,
                  background: idx===i ? T.blood : T.dim2,
                  border: idx===i ? `1px solid ${T.bone}` : 'none',
                  borderRadius:4, cursor:'pointer',
                  transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
                }}/>
              ))}
            </div>

            {/* counter */}
            <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.28em', color:T.dim1, marginTop:16, textTransform:'uppercase' }}>
              {String(idx+1).padStart(2,'0')} / {String(reviews.length).padStart(2,'0')}
            </div>
          </div>

          {/* right — review card */}
          <div className="reveal" style={{ transitionDelay:'.1s' }}>
            <div key={idx} style={{
              background: T.ink2,
              border:`3px solid ${T.dim2}`,
              borderLeft:`4px solid ${T.blood}`,
              borderRadius:'0 var(--rh-2)',
              padding:'32px 28px',
              boxShadow:`6px 6px 0 rgba(139,26,26,.18)`,
              animation:'rhReviewFade .45s ease both',
              position:'relative', overflow:'hidden',
            }}>
              <style>{`@keyframes rhReviewFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>

              {/* big quote mark */}
              <div style={{ position:'absolute', top:-10, right:16, fontFamily:"'Bebas Neue',sans-serif", fontSize:120, color:'rgba(232,223,200,.03)', lineHeight:1, userSelect:'none' }}>"</div>

              <StarRow rating={rv.rating}/>

              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(16px,2.2vw,22px)', color:T.bone, lineHeight:1.35, letterSpacing:'.02em', textTransform:'uppercase', margin:'16px 0 20px' }}>
                "{rv.q}"
              </p>

              {/* avatar + name */}
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{
                  width:40, height:40, flexShrink:0,
                  background:T.blood, borderRadius:'50% 46% 50% 44%/44% 50% 46% 50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:`2px solid ${T.bone}`, boxShadow:`2px 2px 0 ${T.bone}`,
                }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.bone }}>
                    {rv.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.1em', textTransform:'uppercase', color:T.bone }}>{rv.name}</div>
                  <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.22em', textTransform:'uppercase', color:T.dim1 }}>{rv.city}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
