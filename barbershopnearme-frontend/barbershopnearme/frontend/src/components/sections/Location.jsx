import { useRef } from 'react'
import useReveal from '@/hooks/useReveal.js'

const SHOP = {
  address:  '123 Noir Alley, Hattiesburg, MS 39401',
  phone:    '(601) 555-0199',
  phone_raw:'+16015550199',
  hours: [
    { day:'Mon – Fri', time:'9:00 AM – 6:00 PM' },
    { day:'Saturday',  time:'9:00 AM – 4:00 PM' },
    { day:'Sunday',    time:'Closed' },
  ],
  map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393!2d-89.29!3d31.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE5JzEyLjAiTiA4OcKwMTcnMjQuMCJX!5e0!3m2!1sen!2sus!4v1000000000000!5m2!1sen!2sus',
}

const T = {
  ink:'#070504', ink2:'#0F0B09',
  bone:'#E8DFC8', blood:'#8B1A1A', blood2:'#6B0F0F',
  dim1:'rgba(232,223,200,.55)', dim2:'rgba(232,223,200,.14)',
}
const RH = ['14px 8px 12px 10px/10px 12px 8px 14px','8px 14px 10px 12px/12px 8px 14px 10px']

export default function Location() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section className="section" ref={ref}>
      <style>{`
        .loc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }
        .loc-map-frame {
          border: 3px solid ${T.bone};
          border-radius: 8px 14px 10px 12px / 12px 8px 14px 10px;
          overflow: hidden;
          box-shadow: 7px 7px 0 rgba(139,26,26,.25);
        }
        .loc-map-wrap {
          position: relative;
          padding-top: 70%;
          background: ${T.ink2};
        }
        .loc-map-wrap iframe {
          position: absolute;
          inset: 0; width: 100%; height: 100%;
          border: none;
          filter: invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85);
        }
        .loc-hours-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 11px 0;
          border-bottom: 2px solid ${T.dim2};
          gap: 12px;
          flex-wrap: nowrap;
        }
        .loc-hours-day {
          font-family: 'Courier Prime', monospace;
          font-size: 13px;
          color: ${T.dim1};
          flex-shrink: 0;
          min-width: 0;
        }
        .loc-hours-time {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: .06em;
          text-align: right;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .loc-contact-card {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          background: ${T.ink2};
          border: 3px solid ${T.dim2};
          padding: 16px 18px;
          text-decoration: none;
          box-shadow: 4px 4px 0 rgba(139,26,26,.12);
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
          min-width: 0;
        }
        .loc-contact-val {
          font-family: 'Boogaloo', cursive;
          font-size: 14px;
          letter-spacing: .06em;
          color: ${T.bone};
          line-height: 1.4;
          word-break: break-word;
          overflow-wrap: anywhere;
          min-width: 0;
        }
        .loc-dir-btn {
          display: block;
          margin-top: 14px;
          text-align: center;
          font-family: 'Boogaloo', cursive;
          font-size: 16px;
          letter-spacing: .12em;
          text-transform: uppercase;
          background: ${T.blood};
          color: ${T.bone};
          border: 3px solid ${T.bone};
          border-radius: 50px 46px 50px 44px / 44px 50px 46px 50px;
          padding: 13px 24px;
          text-decoration: none;
          box-shadow: 5px 5px 0 ${T.bone};
          transition: all .25s cubic-bezier(.34,1.56,.64,1);
        }
        /* ── TABLET ── */
        @media(max-width:820px){
          .loc-grid { grid-template-columns:1fr!important; gap:36px!important; }
          .loc-map-wrap { padding-top:56%!important; }
        }
        /* ── MOBILE ── */
        @media(max-width:640px){
          .loc-grid { gap:28px!important; }
          .loc-map-wrap { padding-top:0!important; height:240px!important; }
          .loc-map-wrap iframe { position:absolute!important; }
          .loc-hours-row { padding:9px 0!important; }
          .loc-hours-day { font-size:12px!important; }
          .loc-hours-time { font-size:16px!important; }
          .loc-contact-card { padding:12px 14px!important; gap:10px!important; }
          .loc-contact-val { font-size:13px!important; }
          .loc-dir-btn { font-size:15px!important; padding:12px 20px!important; }
        }
        /* ── SMALL PHONES (Galaxy S23=393px, iPhone SE=375px) ── */
        @media(max-width:430px){
          .loc-map-wrap { height:210px!important; }
          .loc-hours-day { font-size:11px!important; }
          .loc-hours-time { font-size:14px!important; }
          .loc-contact-card { padding:10px 12px!important; }
          .loc-contact-val { font-size:12px!important; }
        }
      `}</style>

      <div className="container">
        <div className="section-eyebrow reveal">
          <span className="t-eyebrow-num">06</span>
          <div className="section-eyebrow-rule"/>
          <span className="t-label">Find Us</span>
          <div style={{ flex:1, height:1, background:'rgba(232,223,200,.08)' }}/>
        </div>

        <div className="loc-grid">

          {/* ── LEFT — info ── */}
          <div className="reveal">
            <h2 className="t-title" style={{ marginBottom:28 }}>
              Come See<br/>
              <span style={{ color:'var(--color-blood)' }}>Us.</span>
            </h2>

            {/* hours */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:'.28em', textTransform:'uppercase', color:T.dim1, marginBottom:12 }}>
                Hours
              </div>
              {SHOP.hours.map(h => (
                <div key={h.day} className="loc-hours-row">
                  <span className="loc-hours-day">{h.day}</span>
                  <span className="loc-hours-time" style={{ color: h.time==='Closed' ? 'rgba(248,113,113,.65)' : T.bone }}>
                    {h.time}
                  </span>
                </div>
              ))}
            </div>

            {/* contact cards */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { icon:'📍', label:'Address', val:SHOP.address, href:`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`, rh:RH[0] },
                { icon:'📞', label:'Phone',   val:SHOP.phone,   href:`tel:${SHOP.phone_raw}`, rh:RH[1] },
              ].map((item,i) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                  className="loc-contact-card"
                  style={{ borderRadius:item.rh }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`5px 6px 0 ${T.blood}`}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.dim2;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`4px 4px 0 rgba(139,26,26,.12)`}}
                >
                  <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:9, letterSpacing:'.28em', textTransform:'uppercase', color:T.dim1, marginBottom:3 }}>{item.label}</div>
                    <div className="loc-contact-val">{item.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT — map ── */}
          <div className="reveal" style={{ transitionDelay:'.1s' }}>
            <div className="loc-map-frame">
              {/* sprocket top */}
              <div style={{ height:14, background:T.ink, borderBottom:`2px solid ${T.bone}`, display:'flex', alignItems:'center', gap:3, padding:'0 5px', overflow:'hidden', flexShrink:0 }}>
                {Array.from({length:40}).map((_,i)=>(
                  <div key={i} style={{ width:10,height:8,flexShrink:0,border:`1.5px solid ${T.bone}`,borderRadius:2,background:T.ink }}/>
                ))}
              </div>

              <div className="loc-map-wrap">
                <iframe
                  src={SHOP.map_url}
                  title="Barbershopnearme Location"
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* sprocket bottom */}
              <div style={{ height:14, background:T.ink, borderTop:`2px solid ${T.bone}`, display:'flex', alignItems:'center', gap:3, padding:'0 5px', overflow:'hidden', flexShrink:0 }}>
                {Array.from({length:40}).map((_,i)=>(
                  <div key={i} style={{ width:10,height:8,flexShrink:0,border:`1.5px solid ${T.bone}`,borderRadius:2,background:T.ink }}/>
                ))}
              </div>
            </div>

            <a href={`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`}
              target="_blank" rel="noreferrer"
              className="loc-dir-btn"
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
