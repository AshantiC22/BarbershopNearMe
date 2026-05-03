import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const SHOP = {
  address:  '123 Noir Alley, Hattiesburg, MS 39401',
  phone:    '(601) 555-0199',
  phone_raw:'+16015550199',
  hours: [
    { day:'Monday – Friday', time:'9:00 AM – 6:00 PM' },
    { day:'Saturday',        time:'9:00 AM – 4:00 PM' },
    { day:'Sunday',          time:'Closed' },
  ],
  /* Google Maps embed — replace YOUR_API_KEY or use a plain iframe URL */
  map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393!2d-89.29!3d31.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE5JzEyLjAiTiA4OcKwMTcnMjQuMCJX!5e0!3m2!1sen!2sus!4v1000000000000!5m2!1sen!2sus',
}

const T = {
  ink:'#070504', ink2:'#0F0B09',
  bone:'#E8DFC8', blood:'#8B1A1A',
  dim1:'rgba(232,223,200,.55)', dim2:'rgba(232,223,200,.14)', dim3:'rgba(232,223,200,.06)',
}

const RH = ['14px 8px 12px 10px/10px 12px 8px 14px','8px 14px 10px 12px/12px 8px 14px 10px']

export default function Location() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section className="section" ref={ref}>
      <div className="container">

        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">06</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Find Us</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.08)' }}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>

          {/* left — info */}
          <div className="reveal">
            <h2 className="t-title" style={{ marginBottom:32 }}>
              Come See<br/>
              <span style={{ color:'var(--color-blood)' }}>Us.</span>
            </h2>

            {/* hours */}
            <div style={{ marginBottom:36 }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.28em', textTransform:'uppercase', color:T.dim1, marginBottom:16 }}>
                Hours
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {SHOP.hours.map(h => (
                  <div key={h.day} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 0', borderBottom:`2px solid ${T.dim2}` }}>
                    <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, color:T.dim1 }}>{h.day}</span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:'.06em', color: h.time==='Closed' ? 'rgba(248,113,113,.6)' : T.bone }}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* contact cards */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'📍', label:'Address', val: SHOP.address, href:`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}` },
                { icon:'📞', label:'Phone',   val: SHOP.phone,   href:`tel:${SHOP.phone_raw}` },
              ].map((item,i) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" style={{
                  display:'flex', gap:16, alignItems:'flex-start',
                  background: T.ink2,
                  border:`3px solid ${T.dim2}`,
                  borderRadius: RH[i],
                  padding:'18px 20px',
                  textDecoration:'none',
                  boxShadow:`4px 4px 0 rgba(139,26,26,.12)`,
                  transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.transform='translateY(-4px) rotate(-.4deg)';e.currentTarget.style.boxShadow=`5px 6px 0 ${T.blood}`}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.dim2;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`4px 4px 0 rgba(139,26,26,.12)`}}
                >
                  <span style={{ fontSize:22, flexShrink:0, animation:`floatBob ${3+i*.5}s ease-in-out ${i*.4}s infinite` }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:T.dim1, marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:15, letterSpacing:'.08em', color:T.bone, lineHeight:1.4 }}>{item.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* right — map */}
          <div className="reveal" style={{ transitionDelay:'.1s' }}>
            {/* rubber hose map frame */}
            <div style={{
              border:`3px solid ${T.bone}`,
              borderRadius:'var(--rh-2)',
              overflow:'hidden',
              boxShadow:`7px 7px 0 rgba(139,26,26,.25)`,
              position:'relative',
            }}>
              {/* sprocket top strip */}
              <div style={{ height:18, background:T.ink, borderBottom:`2px solid ${T.bone}`, display:'flex', alignItems:'center', gap:3, padding:'0 6px', overflow:'hidden' }}>
                {Array.from({length:20}).map((_,i) => (
                  <div key={i} style={{ width:14,height:11,flexShrink:0,border:`1.5px solid ${T.bone}`,borderRadius:2,background:T.ink }}/>
                ))}
              </div>

              {/* map iframe */}
              <div style={{ position:'relative', paddingTop:'70%', background:T.ink2 }}>
                <iframe
                  src={SHOP.map_url}
                  title="Barbershopnearme Location"
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none', filter:'invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85)' }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* sprocket bottom strip */}
              <div style={{ height:18, background:T.ink, borderTop:`2px solid ${T.bone}`, display:'flex', alignItems:'center', gap:3, padding:'0 6px', overflow:'hidden' }}>
                {Array.from({length:20}).map((_,i) => (
                  <div key={i} style={{ width:14,height:11,flexShrink:0,border:`1.5px solid ${T.bone}`,borderRadius:2,background:T.ink }}/>
                ))}
              </div>
            </div>

            {/* directions button */}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`}
              target="_blank" rel="noreferrer"
              style={{
                display:'block', marginTop:16, textAlign:'center',
                fontFamily:"'Boogaloo',cursive", fontSize:16, letterSpacing:'.12em', textTransform:'uppercase',
                background:T.blood, color:T.bone,
                border:`3px solid ${T.bone}`,
                borderRadius:'var(--rh-pill)',
                padding:'13px 32px',
                textDecoration:'none',
                boxShadow:`5px 5px 0 ${T.bone}`,
                transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04) rotate(-.5deg)';e.currentTarget.style.background=T.blood2}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.background=T.blood}}
            >
              📍 Get Directions
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
