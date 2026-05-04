import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import api from '@/services/api.js'

/* ─── design tokens ─────────────────────────────────────────── */
const T = {
  ink:'#070504', ink2:'#0F0B09', ink3:'#181210', ink4:'#1e1612',
  bone:'#E8DFC8', bone2:'rgba(232,223,200,.55)', bone3:'rgba(232,223,200,.24)',
  blood:'#8B1A1A', blood2:'#6B0F0F', bloodDim:'rgba(139,26,26,.18)', bloodBorder:'rgba(139,26,26,.45)',
  green:'#4ade80', greenDim:'rgba(74,222,128,.1)', greenBorder:'rgba(74,222,128,.25)',
  red:'#f87171',   redDim:'rgba(248,113,113,.06)', redBorder:'rgba(248,113,113,.25)',
  gold:'#C8A840',  goldDim:'rgba(200,168,64,.12)', goldBorder:'rgba(200,168,64,.3)',
  dim:'rgba(232,223,200,.38)', deep:'rgba(232,223,200,.14)',
}
const sf  = { fontFamily:"'Bebas Neue',sans-serif" }
const rub = { fontFamily:"'Boogaloo',cursive" }
const mono= { fontFamily:"'Courier Prime',monospace" }

/* rubber-hose border radii — nothing is ever a perfect square */
const RH = [
  '14px 8px 12px 10px / 10px 12px 8px 14px',
  '8px 14px 10px 12px / 12px 8px 14px 10px',
  '12px 10px 14px 8px / 8px 14px 10px 12px',
  '10px 12px 8px 14px / 14px 10px 12px 8px',
]
const PILL = '50px 46px 50px 44px / 44px 50px 46px 50px'

/* ─── helpers ────────────────────────────────────────────────── */
const todayISO    = () => new Date().toISOString().split('T')[0]
const fmtTime     = t => { if(!t)return'—'; const[h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}` }
const fmtDateLong = d => new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})
const fmtDateShort= d => new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})

/* ─── ScissorsIcon ───────────────────────────────────────────── */
const ScissorsIcon = ({size=32,color=T.blood,opacity=1})=>(
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{opacity}}>
    <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="3.5"/>
    <circle cx="16" cy="56" r="10" stroke={color} strokeWidth="3.5"/>
    <line x1="24" y1="22" x2="66" y2="64" stroke={color} strokeWidth="4" strokeLinecap="round"/>
    <line x1="24" y1="50" x2="66" y2="8"  stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

/* ─── RHBox — rubber hose card container ─────────────────────── */
const RHBox = ({children,style={},i=0,glow=false})=>(
  <div style={{
    background:T.ink2, border:`2px solid ${T.bone3}`,
    borderRadius:RH[i%4],
    boxShadow: glow
      ? `4px 4px 0 ${T.blood}, 0 0 32px ${T.bloodDim}`
      : `4px 4px 0 rgba(139,26,26,.2)`,
    position:'relative', overflow:'hidden', ...style
  }}>{children}</div>
)

/* ─── StepDot ─────────────────────────────────────────────────── */
const StepDot = ({n,label,active,done})=>(
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,flex:1}}>
    <div style={{
      width:'clamp(26px,7vw,34px)', height:'clamp(26px,7vw,34px)', borderRadius:'50%',
      background: done ? T.blood : active ? T.bloodDim : 'transparent',
      border: `2px solid ${done||active ? T.blood : T.deep}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all .3s',
      boxShadow: active ? `0 0 16px ${T.bloodDim}` : 'none',
    }}>
      {done
        ? <span style={{color:T.bone,...sf,fontSize:14}}>✓</span>
        : <span style={{...sf,fontSize:15,color:active?T.blood:T.deep}}>{n}</span>
      }
    </div>
    <span style={{...mono,fontSize:8,letterSpacing:'.2em',textTransform:'uppercase',color:active?T.bone2:T.deep}}>{label}</span>
  </div>
)

/* ─── BookingCalendar ─────────────────────────────────────────── */
function BookingCalendar({ selectedDate, onSelect, workingDays=[], timeOffDates=[] }){
  const today = new Date(); today.setHours(0,0,0,0)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const firstDay    = new Date(viewYear,viewMonth,1).getDay()
  const daysInMonth = new Date(viewYear,viewMonth+1,0).getDate()

  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }
  const toISO = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const hasSchedule = workingDays.length > 0
  const dowMap = {}
  workingDays.forEach(d => { dowMap[(d.day_of_week+1)%7] = d.is_working })
  const timeOffSet = new Set(timeOffDates)

  const cells = []
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)

  const openDayNames = workingDays.filter(d=>d.is_working)
    .map(d=>['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.day_of_week])
    .join(' · ')

  return (
    <RHBox i={2} style={{overflow:'visible'}}>
      <style>{`
        @keyframes slashPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes calFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .cal-cell{transition:all .15s}
        .cal-cell:hover:not(:disabled){transform:scale(1.12)!important}
      `}</style>

      {/* header */}
      <div style={{background:T.ink,padding:'14px 18px',borderRadius:`${RH[2].split('/')[0].split(' ')[0]} ${RH[2].split('/')[0].split(' ')[1]} 0 0`,borderBottom:`1px solid ${T.bone3}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={prevMonth} style={{width:32,height:32,borderRadius:PILL,background:'transparent',border:`1.5px solid ${T.bone3}`,color:T.dim,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.color=T.blood;e.currentTarget.style.background=T.bloodDim}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.color=T.dim;e.currentTarget.style.background='transparent'}}>‹</button>
        <div style={{textAlign:'center'}}>
          <p style={{...sf,fontSize:18,color:T.bone,letterSpacing:'.1em',textTransform:'uppercase',margin:0,lineHeight:1}}>{MONTHS[viewMonth]}</p>
          <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.3em',marginTop:2}}>{viewYear}</p>
        </div>
        <button onClick={nextMonth} style={{width:32,height:32,borderRadius:PILL,background:'transparent',border:`1.5px solid ${T.bone3}`,color:T.dim,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.color=T.blood;e.currentTarget.style.background=T.bloodDim}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.color=T.dim;e.currentTarget.style.background='transparent'}}>›</button>
      </div>

      <div style={{padding:'14px 14px 16px'}}>
        {/* day labels */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:8,gap:2}}>
          {DAYS.map(d=>(
            <div key={d} style={{...mono,fontSize:8,color:d==='Su'||d==='Sa'?T.deep:T.dim,textAlign:'center',letterSpacing:'.1em',padding:'3px 0'}}>{d}</div>
          ))}
        </div>

        {/* cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
          {cells.map((day,i)=>{
            if(!day) return <div key={`e${i}`}/>
            const iso   = toISO(viewYear,viewMonth,day)
            const date  = new Date(viewYear,viewMonth,day)
            const jsDow = date.getDay()
            const isPast = date < today

            let isUnavailable = false
            if(hasSchedule){
              isUnavailable = dowMap.hasOwnProperty(jsDow) ? !dowMap[jsDow] : true
            } else {
              isUnavailable = jsDow === 0
            }
            const isTimeOff = timeOffSet.has(iso)
            const disabled  = isPast || isUnavailable || isTimeOff
            const isToday   = iso === toISO(today.getFullYear(),today.getMonth(),today.getDate())
            const selected  = iso === selectedDate
            const showSlash = !isPast && (isUnavailable || isTimeOff)

            return (
              <button key={iso} className="cal-cell" onClick={()=>!disabled&&onSelect(iso)} disabled={disabled}
                style={{
                  aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative', overflow:'hidden',
                  borderRadius: selected ? RH[0] : RH[(day+i)%4],
                  ...mono, fontSize:12, fontWeight:selected?700:400,
                  background: selected ? T.blood : isToday ? T.bloodDim : 'transparent',
                  color: selected?T.bone : isPast?'#2a2320' : isUnavailable||isTimeOff?'#2a2320' : isToday?T.blood : T.bone2,
                  border: selected?`2px solid ${T.blood}` : isToday?`1.5px solid ${T.bloodBorder}` : `1.5px solid transparent`,
                  cursor: disabled?'not-allowed':'pointer',
                  boxShadow: selected ? `2px 2px 0 ${T.blood2}, 0 0 14px ${T.bloodDim}` : 'none',
                  transition:'all .15s',
                }}
                onMouseEnter={e=>{ if(!disabled&&!selected){e.currentTarget.style.background=T.bloodDim;e.currentTarget.style.borderColor=T.bloodBorder;e.currentTarget.style.color=T.blood}}}
                onMouseLeave={e=>{ if(!disabled&&!selected){e.currentTarget.style.background=isToday?T.bloodDim:'transparent';e.currentTarget.style.borderColor=isToday?T.bloodBorder:'transparent';e.currentTarget.style.color=isToday?T.blood:T.bone2}}}
              >
                {showSlash && (
                  <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 40 40" preserveAspectRatio="none">
                    <line x1="4" y1="36" x2="36" y2="4" stroke="rgba(139,26,26,.7)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
                <span style={{position:'relative',zIndex:1}}>{day}</span>
              </button>
            )
          })}
        </div>

        {/* legend */}
        <div style={{display:'flex',gap:12,marginTop:14,paddingTop:12,borderTop:`1px solid ${T.deep}`,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,background:T.blood,borderRadius:'50%'}}/>
            <span style={{...mono,fontSize:8,color:T.dim}}>Selected</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,background:T.bloodDim,border:`1px solid ${T.bloodBorder}`,borderRadius:'3px'}}/>
            <span style={{...mono,fontSize:8,color:T.dim}}>Today</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,position:'relative'}}>
            <div style={{width:10,height:10,background:'transparent',border:`1px solid ${T.deep}`,position:'relative',overflow:'hidden',borderRadius:'2px'}}>
              <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} viewBox="0 0 10 10" preserveAspectRatio="none">
                <line x1="1" y1="9" x2="9" y2="1" stroke="rgba(139,26,26,.6)" strokeWidth="1.5"/>
              </svg>
            </div>
            <span style={{...mono,fontSize:8,color:T.dim}}>Closed</span>
          </div>
          {openDayNames&&<span style={{...mono,fontSize:8,color:T.green}}>Open: {openDayNames}</span>}
        </div>
      </div>
    </RHBox>
  )
}

/* ─── TimeSlotGrid ────────────────────────────────────────────── */
function TimeSlotGrid({ slots, bookedSlots, selectedTime, onSelect, loading, timeOff, message, onRetry }){
  if(loading) return (
    <div style={{padding:'36px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
      <div style={{position:'relative',width:48,height:48}}>
        <div style={{position:'absolute',inset:0,border:`2px solid ${T.bloodBorder}`,borderTopColor:T.blood,borderRadius:'50%',animation:'rhSpin .9s linear infinite'}}/>
        <div style={{position:'absolute',inset:6,border:`1px solid ${T.bloodBorder}`,borderBottomColor:T.blood,borderRadius:'50%',animation:'rhSpin .6s linear infinite reverse'}}/>
      </div>
      <p style={{...rub,fontSize:14,color:T.dim,letterSpacing:'.15em',textTransform:'uppercase'}}>Checking the chair...</p>
    </div>
  )

  if(timeOff) return (
    <RHBox i={1} style={{padding:'24px',textAlign:'center',borderColor:T.redBorder,background:T.redDim}}>
      <div style={{fontSize:32,marginBottom:10}}>🚫</div>
      <p style={{...sf,fontSize:22,color:T.red,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Not Available</p>
      <p style={{...mono,fontSize:12,color:T.dim,lineHeight:1.7}}>{message||'Barber is off this day. Try another date.'}</p>
    </RHBox>
  )

  if(!slots||slots.length===0) return (
    <RHBox i={0} style={{padding:'28px',textAlign:'center'}}>
      <div style={{fontSize:36,marginBottom:10}}>✂️</div>
      <p style={{...sf,fontSize:22,color:T.bone2,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>
        {message?.includes('retry') ? 'Connection Error' : 'Fully Booked'}
      </p>
      <p style={{...mono,fontSize:12,color:T.dim,marginBottom:16}}>
        {message?.includes('retry') ? 'Could not load slots.' : 'No open slots. Try another date.'}
      </p>
      {message?.includes('retry')&&onRetry
        ? <button onClick={onRetry} style={{...rub,fontSize:14,letterSpacing:'.12em',textTransform:'uppercase',background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,borderRadius:PILL,color:T.blood,padding:'10px 24px',cursor:'pointer'}}>↺ Retry</button>
        : <Link to="/waitlist" style={{...rub,fontSize:14,letterSpacing:'.12em',textTransform:'uppercase',background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,borderRadius:PILL,color:T.blood,padding:'10px 24px',textDecoration:'none',display:'inline-block'}}>Join Waitlist →</Link>
      }
    </RHBox>
  )

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(90px,calc(25% - 6px)),1fr))',gap:8}}>
      {slots.map((slot,si)=>{
        const display    = fmtTime(slot)
        const isSelected = selectedTime===slot
        const isBooked   = bookedSlots.includes(slot)
        return (
          <button key={slot} onClick={()=>!isBooked&&onSelect(slot)} disabled={isBooked}
            style={{
              padding:'14px 4px', ...sf, fontSize:14, letterSpacing:'.05em', textTransform:'uppercase',
              borderRadius: isSelected ? RH[0] : RH[si%4],
              border: isSelected ? `2px solid ${T.blood}` : isBooked ? `1.5px solid rgba(139,26,26,.12)` : `1.5px solid ${T.bloodBorder}`,
              background: isSelected ? T.blood : isBooked ? 'rgba(139,26,26,.03)' : T.bloodDim,
              color: isSelected ? T.bone : isBooked ? '#2a2320' : T.dim,
              cursor: isBooked ? 'not-allowed' : 'pointer',
              transition:'all .18s',
              position:'relative', overflow:'hidden',
              boxShadow: isSelected ? `3px 3px 0 ${T.blood2}, 0 0 16px ${T.bloodDim}` : 'none',
            }}
            onMouseEnter={e=>{ if(!isBooked&&!isSelected){e.currentTarget.style.background=T.blood;e.currentTarget.style.color=T.bone;e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.transform='scale(1.06) rotate(-.5deg)';e.currentTarget.style.boxShadow=`3px 3px 0 ${T.blood2}`}}}
            onMouseLeave={e=>{ if(!isBooked&&!isSelected){e.currentTarget.style.background=T.bloodDim;e.currentTarget.style.color=T.dim;e.currentTarget.style.borderColor=T.bloodBorder;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}}
          >
            {isBooked && (
              <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 90 44" preserveAspectRatio="none">
                <line x1="4" y1="40" x2="86" y2="4" stroke="rgba(139,26,26,.5)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
            {isSelected && <span style={{position:'absolute',top:3,right:6,fontSize:12,color:T.bone}}>✓</span>}
            <span style={{position:'relative',zIndex:1}}>{display}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   CONFIRMATION SCREEN
══════════════════════════════════════════════════════════════ */
function ConfirmedScreen({ data, onBookAnother }){
  return (
    <div style={{minHeight:'100vh',background:T.ink,display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes rhPop{0%{opacity:0;transform:scale(.7) rotate(-8deg)}60%{transform:scale(1.08) rotate(2deg)}100%{opacity:1;transform:none}}
        @keyframes rhSlide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes rhFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes confettiDrop{from{transform:translateY(-40px) rotate(0deg);opacity:1}to{transform:translateY(100vh) rotate(720deg);opacity:0}}
      `}</style>

      {/* confetti-style blood drops */}
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{
          position:'fixed', top:'-40px',
          left:`${(i*83)%100}%`,
          width: i%3===0 ? 8 : i%3===1 ? 5 : 10,
          height: i%3===0 ? 8 : i%3===1 ? 5 : 10,
          borderRadius:'50% 50% 50% 0',
          background: i%2===0 ? T.blood : T.bone3,
          animation:`confettiDrop ${1.4+(i*.18)}s ease-in ${i*.12}s both`,
          pointerEvents:'none', zIndex:0,
        }}/>
      ))}

      {/* bg glow */}
      <div style={{position:'fixed',inset:0,background:`radial-gradient(ellipse at 50% 40%,rgba(139,26,26,.15) 0%,transparent 70%)`,pointerEvents:'none'}}/>
      <div style={{position:'fixed',inset:0,backgroundImage:`linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px)`,backgroundSize:'64px 64px',pointerEvents:'none'}}/>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:540}}>

        {/* floating scissors */}
        <div style={{textAlign:'center',marginBottom:24,animation:'rhFloat 3s ease-in-out infinite'}}>
          <ScissorsIcon size={64} color={T.blood}/>
        </div>

        {/* headline */}
        <div style={{textAlign:'center',marginBottom:32,animation:'rhPop .6s cubic-bezier(.34,1.56,.64,1) both'}}>
          <p style={{...mono,fontSize:13,color:T.blood,letterSpacing:'.5em',textTransform:'uppercase',marginBottom:12}}>
            ✦ Booking Confirmed ✦
          </p>
          <h1 style={{...sf,fontSize:'clamp(52px,11vw,88px)',lineHeight:.85,textTransform:'uppercase',color:T.bone,margin:0}}>
            You're In<br/>
            <span style={{color:T.blood,textShadow:`4px 4px 0 ${T.blood2}`}}>The Chair.</span>
          </h1>
        </div>

        {/* ticket */}
        <div style={{animation:'rhSlide .5s .25s cubic-bezier(.16,1,.3,1) both'}}>
          <RHBox i={1} glow style={{marginBottom:24}}>
            {/* ticket top — perforated line style */}
            <div style={{background:`repeating-linear-gradient(90deg,${T.blood} 0,${T.blood} 6px,transparent 6px,transparent 12px)`,height:3,marginBottom:0,opacity:.6,borderRadius:`${RH[1].split('/')[0].split(' ')[0]} ${RH[1].split('/')[0].split(' ')[1]} 0 0`}}/>

            <div style={{padding:'20px 24px'}}>
              {/* barber + service big */}
              <div style={{textAlign:'center',marginBottom:20,paddingBottom:18,borderBottom:`1px dashed ${T.bone3}`}}>
                <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.4em',textTransform:'uppercase',marginBottom:6}}>Your appointment with</p>
                <p style={{...sf,fontSize:32,color:T.blood,textTransform:'uppercase',letterSpacing:'-.02em',lineHeight:1,marginBottom:4}}>{data.barber?.name}</p>
                <p style={{...rub,fontSize:16,color:T.bone2,letterSpacing:'.08em',textTransform:'uppercase'}}>{data.service?.name}</p>
              </div>

              {/* details grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
                {[
                  ['📅 Date', fmtDateLong(data.date)],
                  ['⏰ Time', data.time],
                  ['💇 Duration', data.service?.duration_minutes ? `${data.service.duration_minutes} min` : '—'],
                  ['💲 Price', `$${parseFloat(data.service?.price||0).toFixed(2)}`],
                ].map(([label,val])=>(
                  <div key={label} style={{background:T.ink,borderRadius:RH[2],padding:'12px 14px',border:`1px solid ${T.bone3}`}}>
                    <p style={{...mono,fontSize:8,color:T.dim,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:5}}>{label}</p>
                    <p style={{...sf,fontSize:14,color:T.bone,margin:0,lineHeight:1.1}}>{val}</p>
                  </div>
                ))}
              </div>

              {/* payment badge */}
              <div style={{textAlign:'center'}}>
                <span style={{...rub,fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',
                  background: data.payment==='shop' ? T.goldDim : T.greenDim,
                  border:`2px solid ${data.payment==='shop' ? T.goldBorder : T.greenBorder}`,
                  borderRadius:PILL, color: data.payment==='shop' ? T.gold : T.green,
                  padding:'8px 20px', display:'inline-block',
                }}>
                  {data.payment==='shop' ? '💵 Pay in Shop' : '💳 Paid Online'}
                </span>
              </div>
            </div>

            {/* ticket bottom perforated */}
            <div style={{background:`repeating-linear-gradient(90deg,${T.blood} 0,${T.blood} 6px,transparent 6px,transparent 12px)`,height:3,opacity:.6,borderRadius:`0 0 ${RH[1].split('/')[1].trim().split(' ').slice(2).join(' ')}`}}/>
          </RHBox>

          {/* address */}
          <div style={{textAlign:'center',marginBottom:28}}>
            <p style={{...mono,fontSize:12,color:T.dim}}>📍 123 Noir Alley, Hattiesburg, MS — See you there!</p>
          </div>

          {/* actions */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link to="/dashboard" style={{
              flex:1, textAlign:'center', ...sf, fontSize:16, letterSpacing:'.12em', textTransform:'uppercase',
              background:T.blood, color:T.bone, border:`3px solid ${T.bone}`, borderRadius:PILL,
              padding:'14px 20px', textDecoration:'none', transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
              boxShadow:`4px 4px 0 ${T.bone3}`, display:'block',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04) rotate(-.5deg)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none'}}
            >My Bookings</Link>
            <button onClick={onBookAnother} style={{
              flex:1, ...sf, fontSize:16, letterSpacing:'.12em', textTransform:'uppercase',
              background:'transparent', color:T.bone2, border:`2px solid ${T.bone3}`, borderRadius:PILL,
              padding:'14px 20px', cursor:'pointer', transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.color=T.blood;e.currentTarget.style.transform='scale(1.04)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.color=T.bone2;e.currentTarget.style.transform='none'}}
            >Book Another ✂</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PORTAL PAGE
══════════════════════════════════════════════════════════════ */
export default function PortalPage(){
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [step,           setStep]           = useState(1)
  const [services,       setServices]       = useState([])
  const [barbers,        setBarbers]        = useState([])
  const [barberSchedules,setBarberSchedules]= useState({})
  const [loadingData,    setLoadingData]    = useState(true)
  const [dataError,      setDataError]      = useState('')

  const [selectedService,setSelectedService]= useState(null)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedDate,   setSelectedDate]   = useState('')
  const [selectedTime,   setSelectedTime]   = useState('')
  const [workingDays,    setWorkingDays]    = useState([])
  const [timeOffDates,   setTimeOffDates]   = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots,    setBookedSlots]    = useState([])
  const [loadingSlots,   setLoadingSlots]   = useState(false)
  const [timeOff,        setTimeOff]        = useState(false)
  const [timeOffMessage, setTimeOffMessage] = useState('')
  const [paymentMethod,  setPaymentMethod]  = useState('shop')
  const [clientNotes,    setClientNotes]    = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [error,          setError]          = useState('')
  const [confirmed,      setConfirmed]      = useState(false)
  const [confirmData,    setConfirmData]    = useState(null)

  /* If navigated here with a pre-selected barber (e.g. clicked from home page),
     load their schedule and jump straight to step 3 */
  useEffect(()=>{
    const preBarber = location.state?.barber
    if(!preBarber) return
    setSelectedBarber(preBarber)
    setStep(1)   // stay on step 1 — user picks service first, barber already locked
    // prefetch schedule for this barber
    api.get(`barbers/${preBarber.id}/working-days/`)
      .then(d=>{
        setWorkingDays(d.all_days||[])
        setTimeOffDates(d.time_off_dates||[])
        setBarberSchedules(prev=>({...prev,[preBarber.id]:d}))
      })
      .catch(()=>{})
    // prefetch services for this barber
    api.get(`services/?barber=${preBarber.id}`)
      .then(r=>setServices(Array.isArray(r)?r:r.results||[]))
      .catch(()=>{})
    // clear state so refresh doesn't re-trigger
    window.history.replaceState({}, '')
  },[])  // eslint-disable-line

  useEffect(()=>{
    if(!user){ navigate('/login'); return }
    Promise.allSettled([api.get('services/'), api.get('barbers/')])
      .then(([svcR,barbR])=>{
        if(svcR.status==='fulfilled'){ const s=svcR.value; setServices(Array.isArray(s)?s:s.results||[]) }
        if(barbR.status==='fulfilled'){
          const b=barbR.value; const list=Array.isArray(b)?b:b.results||[]
          setBarbers(list)
          list.forEach(barber=>{
            api.get(`barbers/${barber.id}/working-days/`)
              .then(d=>setBarberSchedules(prev=>({...prev,[barber.id]:d})))
              .catch(()=>{})
          })
        } else { setDataError('Could not load barbers. Make sure Django is running.') }
      }).finally(()=>setLoadingData(false))
  },[user])

  const fetchSlots = useCallback(async()=>{
    if(!selectedBarber||!selectedDate||!selectedService) return
    setLoadingSlots(true); setAvailableSlots([]); setBookedSlots([]); setTimeOff(false); setSelectedTime('')
    try{
      const d=await api.get(`available-slots/?barber=${selectedBarber.id}&date=${selectedDate}&service=${selectedService.id}`)
      if(d.time_off){ setTimeOff(true); setTimeOffMessage(d.message||'Barber not available this day.') }
      else { setAvailableSlots(d.available_slots||[]); setBookedSlots(d.booked_slots||[]) }
    }catch{ setTimeOffMessage('Could not load slots — tap to retry.') }
    finally{ setLoadingSlots(false) }
  },[selectedBarber,selectedDate,selectedService])

  useEffect(()=>{
    if(step===3&&selectedBarber&&selectedDate&&selectedService){
      const t=setTimeout(()=>fetchSlots(),300)
      return ()=>clearTimeout(t)
    }
  },[step,selectedDate,fetchSlots])

  const handleBook = async()=>{
    setSubmitting(true); setError('')
    try{
      await api.post('appointments/',{
        service: selectedService.id, barber: selectedBarber.id,
        date: selectedDate,
        time: selectedTime.length===5 ? selectedTime+':00' : selectedTime,
        payment_method: paymentMethod, client_notes: clientNotes,
      })
      setConfirmData({ service:selectedService, barber:selectedBarber, date:selectedDate, time:fmtTime(selectedTime), payment:paymentMethod })
      setConfirmed(true)
    }catch(e){
      const d=e.response?.data
      setError(d?.detail||d?.non_field_errors?.[0]||'Booking failed — that slot may already be taken.')
    }finally{ setSubmitting(false) }
  }

  const resetPortal = ()=>{ setConfirmed(false);setStep(1);setSelectedService(null);setSelectedBarber(null);setSelectedDate('');setSelectedTime('');setClientNotes('');setError('') }

  /* confirmed screen */
  if(confirmed&&confirmData) return <ConfirmedScreen data={confirmData} onBookAnother={resetPortal}/>
  if(!user) return null

  const STEP_LABELS = ['Service','Barber','Schedule','Confirm']

  return (
    <div style={{minHeight:'100vh',background:T.ink,color:T.bone,position:'relative'}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body{background:${T.ink};color:${T.bone};font-family:'Courier Prime',monospace;}
        @keyframes rhSpin{to{transform:rotate(360deg)}}
        @keyframes rhFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes rhShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes confettiDrop{from{transform:translateY(-40px) rotate(0deg);opacity:1}to{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes rhFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes rhPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,26,26,.4)}50%{box-shadow:0 0 0 8px rgba(139,26,26,0)}}
        input[type="date"]{color-scheme:dark}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.bloodBorder};border-radius:4px}
      `}</style>

      {/* grid bg */}
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',backgroundImage:`linear-gradient(rgba(232,223,200,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(232,223,200,.012) 1px,transparent 1px)`,backgroundSize:'72px 72px'}}/>
      {/* radial glow */}
      <div style={{position:'fixed',top:'-8%',right:'-4%',width:600,height:600,background:`radial-gradient(circle,rgba(139,26,26,.08) 0%,transparent 65%)`,pointerEvents:'none',zIndex:0}}/>

      <div style={{position:'relative',zIndex:10,maxWidth:680,margin:'0 auto',padding:'24px max(16px,env(safe-area-inset-left)) max(80px,calc(40px + env(safe-area-inset-bottom)))'}}>

        {/* ── NAV ── */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40}}>
          <Link to="/" style={{...mono,fontSize:12,color:T.dim,textDecoration:'none',letterSpacing:'.2em',textTransform:'uppercase',transition:'color .2s',display:'flex',alignItems:'center',gap:6}}
            onMouseEnter={e=>e.currentTarget.style.color=T.blood}
            onMouseLeave={e=>e.currentTarget.style.color=T.dim}>← Home</Link>
          <div style={{...sf,fontSize:17,letterSpacing:'.2em',textTransform:'uppercase',color:T.bone}}>Barbershopnearme</div>
          <Link to="/dashboard" style={{...mono,fontSize:12,color:T.dim,textDecoration:'none',letterSpacing:'.2em',textTransform:'uppercase',transition:'color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.color=T.blood}
            onMouseLeave={e=>e.currentTarget.style.color=T.dim}>My Bookings →</Link>
        </div>

        {/* ── STEP TRACKER ── */}
        <div style={{marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
            {STEP_LABELS.map((label,i)=>(
              <>
                <StepDot key={label} n={i+1} label={label} active={step===i+1} done={step>i+1}/>
                {i<3 && <div key={`l${i}`} style={{flex:1,height:2,background:step>i+1?T.blood:T.deep,transition:'background .4s',margin:'0 4px',marginBottom:22}}/>}
              </>
            ))}
          </div>
        </div>

        {/* ── PAGE TITLE ── */}
        <div style={{marginBottom:32,animation:'rhFadeUp .5s cubic-bezier(.16,1,.3,1) both'}}>
          <p style={{...mono,fontSize:13,color:T.blood,letterSpacing:'.5em',textTransform:'uppercase',marginBottom:10}}>
            ✦ Step 0{step} of 04
          </p>
          <h1 style={{...sf,fontSize:'clamp(2rem,7vw,3.4rem)',textTransform:'uppercase',lineHeight:.9,margin:0}}>
            {['Choose Your ','Pick Your ','Set The ','Lock It '][step-1]}
            <span style={{color:T.blood}}>{['Service_','Barber_','Schedule_','In_'][step-1]}</span>
          </h1>
        </div>

        {dataError && (
          <RHBox i={3} style={{padding:'18px 20px',marginBottom:24,borderColor:T.redBorder,background:T.redDim}}>
            <p style={{...rub,fontSize:14,color:T.red,textTransform:'uppercase',letterSpacing:'.12em',marginBottom:8}}>{dataError}</p>
            <button onClick={()=>window.location.reload()} style={{...mono,fontSize:13,color:T.blood,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>↺ Retry</button>
          </RHBox>
        )}

        {loadingData ? (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{height:80,borderRadius:RH[i%4],background:`linear-gradient(90deg,rgba(232,223,200,.02) 25%,rgba(232,223,200,.05) 50%,rgba(232,223,200,.02) 75%)`,backgroundSize:'200% 100%',animation:'rhShimmer 1.5s infinite'}}/>
            ))}
          </div>
        ) : (
          <>
            {/* ════════ STEP 1 — SERVICE ════════ */}
            {step===1&&(
              <div style={{display:'flex',flexDirection:'column',gap:10,animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both'}}>

                {/* Pre-selected barber banner */}
                {selectedBarber && (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    padding:'12px 18px',background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,
                    borderRadius:PILL,marginBottom:4}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      {(selectedBarber.photo_url||selectedBarber.photo_data) && (
                        <div style={{width:32,height:32,borderRadius:'50%',overflow:'hidden',
                          border:`2px solid ${T.bloodBorder}`,flexShrink:0}}>
                          <img src={selectedBarber.photo_url||selectedBarber.photo_data}
                            alt={selectedBarber.name}
                            style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                      )}
                      <span style={{...rub,fontSize:14,textTransform:'uppercase',
                        color:T.blood,letterSpacing:'.08em'}}>
                        ✂ Booking with {selectedBarber.name}
                      </span>
                    </div>
                    <button onClick={()=>{setSelectedBarber(null)}}
                      style={{...mono,fontSize:12,color:T.dim,background:'none',border:'none',
                        cursor:'pointer',letterSpacing:'.2em',textTransform:'uppercase',
                        transition:'color .2s'}}
                      onMouseEnter={e=>e.target.style.color=T.blood}
                      onMouseLeave={e=>e.target.style.color=T.dim}>
                      Change
                    </button>
                  </div>
                )}

                {services.length===0
                  ? <p style={{...sf,fontSize:18,color:T.deep,textTransform:'uppercase'}}>No services available.</p>
                  : services.map((svc,i)=>(
                    <button key={svc.id} onClick={()=>{setSelectedService(svc); selectedBarber ? setStep(3) : setStep(2)}}
                      style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 22px',background:T.ink2,border:`2px solid ${T.bone3}`,borderRadius:RH[i%4],cursor:'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',textAlign:'left',boxShadow:`3px 3px 0 rgba(139,26,26,.15)`}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.background=T.bloodDim;e.currentTarget.style.transform='translateX(4px) rotate(.2deg)';e.currentTarget.style.boxShadow=`5px 5px 0 ${T.blood2}`}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.background=T.ink2;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`3px 3px 0 rgba(139,26,26,.15)`}}>
                      <div style={{display:'flex',alignItems:'center',gap:20}}>
                        <div style={{width:44,height:44,borderRadius:RH[i%4],background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{...sf,fontSize:16,color:T.blood}}>{String(i+1).padStart(2,'0')}</span>
                        </div>
                        <div>
                          <p style={{...sf,fontSize:18,textTransform:'uppercase',color:T.bone,margin:'0 0 3px',letterSpacing:'-.01em'}}>{svc.name}</p>
                          {svc.duration_minutes&&<p style={{...mono,fontSize:12,color:T.dim,margin:0}}>{svc.duration_minutes} min ✦ in the chair</p>}
                        </div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <p style={{...sf,fontSize:28,color:T.blood,margin:0,lineHeight:1}}>${parseFloat(svc.price||0).toFixed(2)}</p>
                        <p style={{...mono,fontSize:8,color:T.dim,letterSpacing:'.2em',textTransform:'uppercase',marginTop:2}}>Select →</p>
                      </div>
                    </button>
                  ))
                }
              </div>
            )}

            {/* ════════ STEP 2 — BARBER ════════ */}
            {step===2&&(
              <div style={{animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both'}}>
                {/* recap chip */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,padding:'12px 18px',background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,borderRadius:PILL}}>
                  <span style={{...rub,fontSize:14,textTransform:'uppercase',color:T.blood,letterSpacing:'.08em'}}>✂ {selectedService?.name}</span>
                  <button onClick={()=>setStep(1)} style={{...mono,fontSize:12,color:T.dim,background:'none',border:'none',cursor:'pointer',letterSpacing:'.2em',textTransform:'uppercase',transition:'color .2s'}}
                    onMouseEnter={e=>e.target.style.color=T.blood}
                    onMouseLeave={e=>e.target.style.color=T.dim}>Change</button>
                </div>

                {barbers.length===0
                  ? <p style={{...sf,fontSize:18,color:T.deep,textTransform:'uppercase'}}>No barbers available.</p>
                  : barbers.map((b,bi)=>(
                    <button key={b.id} onClick={()=>{
                      setSelectedBarber(b); setSelectedDate(''); setSelectedTime('')
                      const sched=barberSchedules[b.id]||{all_days:[],time_off_dates:[],has_schedule:false}
                      setWorkingDays(sched.all_days||[])
                      setTimeOffDates(sched.time_off_dates||[])
                      api.get(`services/?barber=${b.id}`).then(r=>setServices(Array.isArray(r)?r:r.results||[])).catch(()=>{})
                      setStep(3)
                    }}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:18,padding:'18px 20px',background:T.ink2,border:`2px solid ${T.bone3}`,borderRadius:RH[bi%4],cursor:'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',textAlign:'left',marginBottom:12,boxShadow:`3px 3px 0 rgba(139,26,26,.15)`}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blood;e.currentTarget.style.background=T.bloodDim;e.currentTarget.style.transform='translateX(4px)';e.currentTarget.style.boxShadow=`5px 5px 0 ${T.blood2}`}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.background=T.ink2;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=`3px 3px 0 rgba(139,26,26,.15)`}}>
                      {/* avatar */}
                      <div style={{width:'clamp(56px,15vw,72px)',height:'clamp(56px,15vw,72px)',flexShrink:0,border:`3px solid ${T.bloodBorder}`,overflow:'hidden',background:'#111',position:'relative',borderRadius:RH[bi%4]}}>
                        {b.photo_url||b.photo_data ? (
                          <img src={b.photo_url||b.photo_data} alt={b.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}}/>
                        ):(
                          <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg,${T.ink3},${T.ink2})`}}>
                            <span style={{...sf,fontSize:26,color:T.blood}}>{b.name?.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div style={{position:'absolute',bottom:4,right:4,width:10,height:10,background:T.green,borderRadius:'50%',border:`2px solid ${T.ink}`}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{...sf,fontSize:20,textTransform:'uppercase',color:T.bone,margin:'0 0 3px',letterSpacing:'-.02em'}}>{b.name}</p>
                        <p style={{...mono,fontSize:13,color:T.green,letterSpacing:'.3em',textTransform:'uppercase',margin:'0 0 5px'}}>✦ Accepting Clients</p>
                        {b.bio&&<p style={{...mono,fontSize:13,color:T.dim,margin:0,lineHeight:1.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.bio}</p>}
                      </div>
                      <div style={{flexShrink:0}}>
                        <div style={{width:36,height:36,borderRadius:PILL,background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{...sf,fontSize:16,color:T.blood}}>→</span>
                        </div>
                      </div>
                    </button>
                  ))
                }
              </div>
            )}

            {/* ════════ STEP 3 — SCHEDULE ════════ */}
            {step===3&&(
              <div style={{animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both'}}>
                {/* recap chip */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,padding:'12px 18px',background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,borderRadius:PILL,flexWrap:'wrap',gap:8}}>
                  <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                    <span style={{...rub,fontSize:14,textTransform:'uppercase',color:T.blood}}>✂ {selectedService?.name}</span>
                    <span style={{...mono,fontSize:12,color:T.dim}}>with {selectedBarber?.name}</span>
                  </div>
                  <button onClick={()=>setStep(2)} style={{...mono,fontSize:12,color:T.dim,background:'none',border:'none',cursor:'pointer',letterSpacing:'.2em',textTransform:'uppercase',transition:'color .2s'}}
                    onMouseEnter={e=>e.target.style.color=T.blood}
                    onMouseLeave={e=>e.target.style.color=T.dim}>Change</button>
                </div>

                {/* calendar */}
                <div style={{marginBottom:28}}>
                  <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.4em',textTransform:'uppercase',marginBottom:12}}>✦ Pick Your Date</p>
                  <BookingCalendar selectedDate={selectedDate} onSelect={d=>{setSelectedDate(d);setSelectedTime('')}} workingDays={workingDays} timeOffDates={timeOffDates}/>
                </div>

                {/* slots */}
                {selectedDate ? (
                  <div style={{marginBottom:28}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.4em',textTransform:'uppercase',margin:0}}>✦ Pick Your Time</p>
                      {!loadingSlots&&!timeOff&&availableSlots.length>0&&(
                        <span style={{...mono,fontSize:13,color:T.green}}>{availableSlots.length} slot{availableSlots.length!==1?'s':''} open</span>
                      )}
                    </div>
                    <TimeSlotGrid slots={availableSlots} bookedSlots={bookedSlots} selectedTime={selectedTime} onSelect={setSelectedTime} loading={loadingSlots} timeOff={timeOff} message={timeOffMessage} onRetry={fetchSlots}/>
                  </div>
                ):(
                  <RHBox i={2} style={{padding:'24px',textAlign:'center',marginBottom:28}}>
                    <p style={{...sf,fontSize:18,color:T.deep,letterSpacing:'.15em',textTransform:'uppercase'}}>Pick a date to see available times</p>
                  </RHBox>
                )}

                <button onClick={()=>setStep(4)} disabled={!selectedDate||!selectedTime}
                  style={{width:'100%',padding:'18px',background:!selectedDate||!selectedTime?T.ink3:T.blood,color:!selectedDate||!selectedTime?T.deep:T.bone,...sf,fontSize:18,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',border:`3px solid ${!selectedDate||!selectedTime?T.deep:T.bone}`,borderRadius:PILL,cursor:!selectedDate||!selectedTime?'not-allowed':'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',boxShadow:selectedDate&&selectedTime?`5px 5px 0 ${T.bone3}`:''}}
                  onMouseEnter={e=>{if(selectedDate&&selectedTime){e.currentTarget.style.transform='scale(1.02) rotate(-.3deg)';e.currentTarget.style.background=T.blood2}}}
                  onMouseLeave={e=>{if(selectedDate&&selectedTime){e.currentTarget.style.transform='none';e.currentTarget.style.background=T.blood}}}>
                  Review Booking →
                </button>
              </div>
            )}

            {/* ════════ STEP 4 — CONFIRM ════════ */}
            {step===4&&(
              <div style={{animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both'}}>

                {/* ticket-style summary */}
                <RHBox i={1} glow style={{marginBottom:24,overflow:'visible'}}>
                  {/* top label */}
                  <div style={{background:T.blood,padding:'12px 24px',borderRadius:`${RH[1].split('/')[0].split(' ')[0]} ${RH[1].split('/')[0].split(' ')[1]} 0 0`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{...sf,fontSize:16,color:T.bone,letterSpacing:'.3em',textTransform:'uppercase'}}>Booking Summary</span>
                    <ScissorsIcon size={20} color={T.bone} opacity={.7}/>
                  </div>

                  {/* perforated strip */}
                  <div style={{background:`repeating-linear-gradient(90deg,${T.bone3} 0,${T.bone3} 6px,transparent 6px,transparent 12px)`,height:3}}/>

                  <div style={{padding:'20px 24px'}}>
                    {/* big service + barber */}
                    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,paddingBottom:18,borderBottom:`1px dashed ${T.bone3}`}}>
                      <div style={{width:52,height:52,borderRadius:RH[0],background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <ScissorsIcon size={28} color={T.blood}/>
                      </div>
                      <div>
                        <p style={{...sf,fontSize:22,color:T.bone,textTransform:'uppercase',letterSpacing:'-.01em',margin:'0 0 2px'}}>{selectedService?.name}</p>
                        <p style={{...rub,fontSize:13,color:T.blood,textTransform:'uppercase',letterSpacing:'.08em',margin:0}}>✂ with {selectedBarber?.name}</p>
                      </div>
                    </div>

                    {/* details 2-col */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
                      {[
                        ['📅 Date',    fmtDateLong(selectedDate)],
                        ['⏰ Time',    fmtTime(selectedTime)],
                        ['⏱ Duration',selectedService?.duration_minutes?`${selectedService.duration_minutes} min`:'—'],
                        ['💲 Price',   `$${parseFloat(selectedService?.price||0).toFixed(2)}`],
                      ].map(([label,val])=>(
                        <div key={label} style={{background:T.ink,borderRadius:RH[2],padding:'11px 14px',border:`1px solid ${T.bone3}`}}>
                          <p style={{...mono,fontSize:8,color:T.dim,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:4}}>{label}</p>
                          <p style={{...sf,fontSize:label.includes('Date')?12:16,color:T.bone,margin:0,lineHeight:1.1}}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* bottom perforated */}
                  <div style={{background:`repeating-linear-gradient(90deg,${T.bone3} 0,${T.bone3} 6px,transparent 6px,transparent 12px)`,height:3}}/>
                  <div style={{padding:'16px 24px 20px'}}>
                    <button onClick={()=>setStep(3)} style={{...mono,fontSize:12,color:T.dim,background:'none',border:'none',cursor:'pointer',letterSpacing:'.2em',textTransform:'uppercase',transition:'color .2s',padding:0}}
                      onMouseEnter={e=>e.target.style.color=T.blood}
                      onMouseLeave={e=>e.target.style.color=T.dim}>← Change Schedule</button>
                  </div>
                </RHBox>

                {/* style notes */}
                <RHBox i={2} style={{padding:'18px 20px',marginBottom:18}}>
                  <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.4em',textTransform:'uppercase',marginBottom:10}}>✦ Style Request (optional)</p>
                  <textarea value={clientNotes} onChange={e=>setClientNotes(e.target.value)}
                    placeholder="e.g. Low fade, leave length on top, lineup..."
                    rows={3} style={{width:'100%',background:T.ink,border:`1.5px solid ${T.bone3}`,borderRadius:RH[3],padding:'12px 14px',color:T.bone,...mono,fontSize:12,outline:'none',resize:'vertical',transition:'border-color .2s'}}
                    onFocus={e=>e.target.style.borderColor=T.blood}
                    onBlur={e=>e.target.style.borderColor=T.bone3}/>
                </RHBox>

                {/* payment */}
                <RHBox i={0} style={{padding:'18px 20px',marginBottom:24}}>
                  <p style={{...mono,fontSize:13,color:T.dim,letterSpacing:'.4em',textTransform:'uppercase',marginBottom:12}}>✦ Payment Method</p>
                  <div style={{display:'flex',gap:10}}>
                    {[['shop','💵','Pay In Shop',T.gold,T.goldDim,T.goldBorder],['online','💳','Pay Online',T.green,T.greenDim,T.greenBorder]].map(([val,emoji,label,color,bg,border])=>(
                      <button key={val} onClick={()=>setPaymentMethod(val)}
                        style={{flex:1,padding:'16px 8px',background:paymentMethod===val?bg:T.ink,border:`2px solid ${paymentMethod===val?color:T.bone3}`,borderRadius:RH[val==='shop'?0:2],color:paymentMethod===val?color:T.dim,...sf,fontSize:15,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s',boxShadow:paymentMethod===val?`3px 3px 0 ${border}`:''}}
                        onMouseEnter={e=>{if(paymentMethod!==val){e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color}}}
                        onMouseLeave={e=>{if(paymentMethod!==val){e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.color=T.dim}}}>
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </RHBox>

                {error&&(
                  <RHBox i={3} style={{padding:'14px 18px',marginBottom:20,borderColor:T.redBorder,background:T.redDim}}>
                    <p style={{...mono,fontSize:12,color:T.red,margin:0}}>{error}</p>
                  </RHBox>
                )}

                {/* confirm button */}
                <button onClick={handleBook} disabled={submitting}
                  style={{width:'100%',padding:'20px',background:submitting?T.bloodDim:T.blood,color:T.bone,...sf,fontSize:20,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',border:`3px solid ${T.bone}`,borderRadius:PILL,cursor:submitting?'not-allowed':'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',opacity:submitting?.7:1,boxShadow:`5px 5px 0 ${T.bone3}`}}
                  onMouseEnter={e=>{if(!submitting){e.currentTarget.style.transform='scale(1.02) rotate(-.3deg)';e.currentTarget.style.background=T.blood2;e.currentTarget.style.boxShadow=`7px 7px 0 ${T.bone3}`}}}
                  onMouseLeave={e=>{if(!submitting){e.currentTarget.style.transform='none';e.currentTarget.style.background=T.blood;e.currentTarget.style.boxShadow=`5px 5px 0 ${T.bone3}`}}}>
                  {submitting ? (
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                      <span style={{width:16,height:16,border:`2px solid rgba(232,223,200,.65)`,borderTopColor:T.bone,borderRadius:'50%',display:'inline-block',animation:'rhSpin .7s linear infinite'}}/>
                      Booking...
                    </span>
                  ) : '✂ Confirm Booking →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
