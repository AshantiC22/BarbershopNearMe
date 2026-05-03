import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import api from '@/services/api.js'

/* ─── design tokens ─────────────────────────────────────────── */
const T = {
  ink:'#070504', ink2:'#0F0B09', ink3:'#181210', ink4:'#1e1612',
  bone:'#E8DFC8', bone2:'rgba(232,223,200,.55)', bone3:'rgba(232,223,200,.1)',
  blood:'#8B1A1A', blood2:'#6B0F0F', bloodDim:'rgba(139,26,26,.18)', bloodBorder:'rgba(139,26,26,.4)',
  green:'#4ade80', greenDim:'rgba(74,222,128,.1)', greenBorder:'rgba(74,222,128,.2)',
  red:'#f87171',   redDim:'rgba(248,113,113,.07)', redBorder:'rgba(248,113,113,.22)',
  gold:'#C8A840',  goldDim:'rgba(200,168,64,.12)', goldBorder:'rgba(200,168,64,.28)',
  orange:'#fb923c',orangeDim:'rgba(251,146,60,.1)',orangeBorder:'rgba(251,146,60,.25)',
  dim:'rgba(232,223,200,.38)', deep:'rgba(232,223,200,.12)',
}
const sf  = { fontFamily:"'Bebas Neue',sans-serif" }
const rub = { fontFamily:"'Boogaloo',cursive" }
const mono= { fontFamily:"'Courier Prime',monospace" }
const RH  = [
  '14px 8px 12px 10px / 10px 12px 8px 14px',
  '8px 14px 10px 12px / 12px 8px 14px 10px',
  '12px 10px 14px 8px / 8px 14px 10px 12px',
  '10px 12px 8px 14px / 14px 10px 12px 8px',
]
const PILL = '50px 46px 50px 44px / 44px 50px 46px 50px'

/* ─── helpers ─────────────────────────────────────────────── */
const fmtDate = d => new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})
const fmtTime = t => { if(!t)return''; const[h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}` }
const todayISO = () => new Date().toISOString().split('T')[0]

/* ─── status config ─────────────────────────────────────────── */
const STATUS = {
  confirmed:    { label:'Confirmed',        color:T.green,   bg:T.greenDim,  border:T.greenBorder },
  pending_shop: { label:'Awaiting Arrival', color:T.orange,  bg:T.orangeDim, border:T.orangeBorder},
  completed:    { label:'Completed',        color:T.dim,     bg:T.deep,      border:T.bone3       },
  no_show:      { label:'No Show',          color:T.red,     bg:T.redDim,    border:T.redBorder   },
  cancelled:    { label:'Cancelled',        color:T.dim,     bg:T.deep,      border:T.bone3       },
}

/* ─── ScissorsIcon ──────────────────────────────────────────── */
const ScissorsIcon = ({size=28,color=T.blood,opacity=1})=>(
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{opacity,flexShrink:0}}>
    <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="3.5"/>
    <circle cx="16" cy="56" r="10" stroke={color} strokeWidth="3.5"/>
    <line x1="24" y1="22" x2="66" y2="64" stroke={color} strokeWidth="4" strokeLinecap="round"/>
    <line x1="24" y1="50" x2="66" y2="8"  stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

/* ─── StatusBadge ─────────────────────────────────────────── */
function StatusBadge({ status }){
  const s = STATUS[status] || STATUS.confirmed
  return (
    <span style={{
      ...mono, fontSize:9, letterSpacing:'.2em', textTransform:'uppercase',
      color:s.color, background:s.bg, border:`2px solid ${s.border}`,
      borderRadius:PILL, padding:'5px 14px', whiteSpace:'nowrap',
    }}>{s.label}</span>
  )
}

/* ─── ApptCard ────────────────────────────────────────────── */
function ApptCard({ appt, onCancel, onRequestCancel, i }){
  const [cancelling, setCancelling] = useState(false)
  const [hovering,   setHovering]   = useState(false)

  const handleCancel = () => onRequestCancel(appt)

  const canCancel = ['confirmed','pending_shop'].includes(appt.status)
  const isPast    = new Date(appt.date+'T'+appt.time) < new Date()
  const isToday   = appt.date === todayISO()
  const sCfg      = STATUS[appt.status] || STATUS.confirmed

  /* top accent color by status */
  const accentColor = appt.status==='confirmed' ? T.green
    : appt.status==='pending_shop' ? T.orange
    : appt.status==='completed'    ? T.dim
    : T.blood

  return (
    <div
      onMouseEnter={()=>setHovering(true)}
      onMouseLeave={()=>setHovering(false)}
      style={{
        background:T.ink2, border:`2px solid ${hovering?T.bloodBorder:T.bone3}`,
        borderRadius:RH[i%4],
        boxShadow: hovering ? `5px 5px 0 ${T.blood2}, 0 0 24px ${T.bloodDim}` : `4px 4px 0 rgba(139,26,26,.18)`,
        position:'relative', overflow:'hidden',
        transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
        transform: hovering ? 'translateY(-3px) rotate(.2deg)' : 'none',
      }}>

      {/* top status stripe */}
      <div style={{height:4,background:`linear-gradient(to right,${accentColor},transparent)`,opacity:.8}}/>

      {/* ghost scissors watermark */}
      <div style={{position:'absolute',bottom:-8,right:-8,opacity:.06,pointerEvents:'none'}}>
        <ScissorsIcon size={80} color={T.bone}/>
      </div>

      <div style={{padding:'22px 24px 20px',position:'relative'}}>

        {/* top row: service + status */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:14,flexWrap:'wrap'}}>
          <div>
            <p style={{...sf,fontSize:24,color:T.bone,letterSpacing:'-.01em',textTransform:'uppercase',margin:'0 0 4px',lineHeight:1}}>{appt.service_name}</p>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <ScissorsIcon size={14} color={T.blood} opacity={.8}/>
              <p style={{...rub,fontSize:13,color:T.blood,textTransform:'uppercase',letterSpacing:'.08em',margin:0}}>{appt.barber_name}</p>
            </div>
          </div>
          <StatusBadge status={appt.status}/>
        </div>

        {/* meta row */}
        <div style={{display:'flex',gap:0,flexWrap:'wrap',borderTop:`1px dashed ${T.bone3}`,paddingTop:14}}>
          {[
            {label:'Date',  val:fmtDate(appt.date),  highlight:isToday},
            {label:'Time',  val:fmtTime(appt.time),  highlight:false},
            {label:'Price', val:`$${appt.service_price||'—'}`, highlight:false},
          ].map(({label,val,highlight},mi)=>(
            <div key={label} style={{flex:1,minWidth:90,padding:`0 ${mi===0?0:16}px`,borderLeft:mi>0?`1px solid ${T.bone3}`:''}} >
              <p style={{...mono,fontSize:8,letterSpacing:'.3em',textTransform:'uppercase',color:T.deep,marginBottom:4}}>{label}</p>
              <p style={{...sf,fontSize:16,color:highlight?T.blood:T.bone,margin:0,lineHeight:1}}>
                {highlight && <span style={{...mono,fontSize:8,color:T.blood,letterSpacing:'.2em',display:'block',marginBottom:2}}>TODAY</span>}
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* payment badge */}
        {appt.payment_method && (
          <div style={{marginTop:12}}>
            <span style={{...mono,fontSize:8,letterSpacing:'.2em',textTransform:'uppercase',
              color: appt.payment_method==='online' ? T.green : T.gold,
              background: appt.payment_method==='online' ? T.greenDim : T.goldDim,
              border:`1px solid ${appt.payment_method==='online' ? T.greenBorder : T.goldBorder}`,
              borderRadius:PILL, padding:'3px 12px',
            }}>
              {appt.payment_method==='online' ? '💳 Paid Online' : '💵 Pay In Shop'}
            </span>
          </div>
        )}

        {/* cancel button */}
        {canCancel && !isPast && (
          <button onClick={handleCancel} disabled={cancelling}
            style={{marginTop:16,...rub,fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',
              background:'transparent', color:'rgba(248,113,113,.6)',
              border:`2px solid rgba(248,113,113,.2)`, borderRadius:PILL,
              padding:'7px 20px', cursor:cancelling?'not-allowed':'pointer',
              opacity:cancelling?.5:1, transition:'all .2s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.color=T.red;e.currentTarget.style.borderColor='rgba(248,113,113,.5)';e.currentTarget.style.background=T.redDim}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(248,113,113,.6)';e.currentTarget.style.borderColor='rgba(248,113,113,.2)';e.currentTarget.style.background='transparent'}}
          >{cancelling ? 'Cancelling...' : '✕ Cancel Appointment'}</button>
        )}
      </div>
    </div>
  )
}

/* ─── EmptyState ────────────────────────────────────────────── */
function EmptyState({ tab, onBook }){
  return (
    <div style={{textAlign:'center',padding:'72px 24px',animation:'rhFadeUp .5s cubic-bezier(.16,1,.3,1) both'}}>
      <div style={{display:'inline-block',marginBottom:24,animation:'rhFloat 3s ease-in-out infinite'}}>
        <ScissorsIcon size={64} color={T.bloodBorder}/>
      </div>
      <p style={{...sf,fontSize:32,color:T.deep,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>
        {tab==='upcoming' ? 'Chair is Empty' : 'No History Yet'}
      </p>
      <p style={{...mono,fontSize:12,color:T.deep,lineHeight:1.7,marginBottom:28}}>
        {tab==='upcoming' ? "You've got a clean slate. Book your first cut and take a seat." : "Completed and past appointments will show up here."}
      </p>
      {tab==='upcoming' && (
        <button onClick={onBook} style={{
          ...rub,fontSize:16,letterSpacing:'.12em',textTransform:'uppercase',
          background:T.blood, color:T.bone, border:`3px solid ${T.bone}`,
          borderRadius:PILL, padding:'13px 34px', cursor:'pointer',
          boxShadow:`5px 5px 0 ${T.bone3}`, transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.06) rotate(-.5deg)';e.currentTarget.style.background=T.blood2}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.background=T.blood}}
        >✂ Book My First Cut</button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
══════════════════════════════════════════════════════════════ */
export default function DashboardPage(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appts,      setAppts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState('upcoming')
  const [toast,      setToast]      = useState(null)   // {msg, type}
  const [cancelModal,setCancelModal]= useState(null)   // appt object
  const [cancelling, setCancelling] = useState(false)

  const showToast = (msg, type='success') => {
    setToast({msg,type})
    setTimeout(()=>setToast(null), 4000)
  }

  const requestCancel = (appt) => setCancelModal(appt)

  const doCancel = async () => {
    if(!cancelModal) return
    setCancelling(true)
    try {
      await api.patch(`appointments/${cancelModal.id}/`, { status: 'cancelled' })
      onCancel(cancelModal.id)
      setCancelModal(null)
      showToast('Appointment cancelled successfully.')
    } catch(e) {
      showToast(e.message || 'Could not cancel. Try again.', 'error')
    } finally { setCancelling(false) }
  }

  useEffect(()=>{
    if(!user){ navigate('/login'); return }
    api.get('/appointments/?my=true')
      .then(d=>setAppts(Array.isArray(d)?d:d.results||d.appointments||[]))
      .catch(()=>setAppts([]))
      .finally(()=>setLoading(false))
  },[user])

  const onCancel = id => setAppts(a=>a.map(x=>x.id===id?{...x,status:'cancelled'}:x))

  const now      = new Date()
  const upcoming = appts.filter(a=>['confirmed','pending_shop'].includes(a.status)&&new Date(a.date+'T'+a.time)>=now)
  const past     = appts.filter(a=>a.status==='completed'||new Date(a.date+'T'+a.time)<now)
  const shown    = tab==='upcoming' ? upcoming : past

  if(!user) return null

  return (
    <div style={{minHeight:'100vh',background:T.ink,color:T.bone,fontFamily:"'Courier Prime',monospace"}}>

      {/* ── TOAST ── */}
      {toast&&(
        <div style={{
          position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:9999,
          padding:'12px 24px',
          background: toast.type==='error' ? 'rgba(139,26,26,.95)' : 'rgba(15,11,9,.97)',
          border:`2px solid ${toast.type==='error' ? T.bloodBorder : T.greenBorder}`,
          borderRadius:PILL,
          backdropFilter:'blur(20px)',
          display:'flex',alignItems:'center',gap:10,
          boxShadow:`0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${toast.type==='error'?T.bloodBorder:T.greenBorder}`,
          animation:'toastSlide .35s cubic-bezier(.34,1.56,.64,1) both',
          whiteSpace:'nowrap',
        }}>
          <div style={{width:8,height:8,borderRadius:'50%',background:toast.type==='error'?T.blood:T.green,boxShadow:`0 0 8px ${toast.type==='error'?T.blood:T.green}`,flexShrink:0}}/>
          <span style={{...mono,fontSize:12,color:toast.type==='error'?T.bone:T.green,letterSpacing:'.05em'}}>{toast.msg}</span>
        </div>
      )}

      {/* ── CANCEL CONFIRM MODAL ── */}
      {cancelModal&&(
        <div onClick={()=>!cancelling&&setCancelModal(null)}
          style={{position:'fixed',inset:0,zIndex:8000,background:'rgba(7,5,4,.92)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'rhFadeUp .2s ease both'}}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:'100%',maxWidth:420,
            background:T.ink2,border:`2px solid ${T.bloodBorder}`,
            borderRadius:RH[1],
            boxShadow:`6px 6px 0 ${T.blood2}, 0 0 40px rgba(139,26,26,.2)`,
            overflow:'hidden',
            animation:'rhPop .35s cubic-bezier(.34,1.56,.64,1) both',
          }}>
            {/* red top bar */}
            <div style={{height:4,background:`linear-gradient(to right,${T.blood},${T.blood2},transparent)`}}/>
            <div style={{padding:'24px 26px 20px'}}>
              {/* icon + title */}
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                <div style={{width:46,height:46,borderRadius:RH[0],background:T.bloodDim,border:`2px solid ${T.bloodBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <ScissorsIcon size={24} color={T.blood}/>
                </div>
                <div>
                  <p style={{...sf,fontSize:20,color:T.bone,textTransform:'uppercase',letterSpacing:'.04em',margin:'0 0 2px'}}>Cancel Appointment?</p>
                  <p style={{...mono,fontSize:10,color:T.dim,margin:0,letterSpacing:'.1em'}}>This cannot be undone</p>
                </div>
              </div>
              {/* appointment summary */}
              <div style={{padding:'14px 16px',background:T.ink,borderRadius:RH[2],border:`1px solid ${T.bone3}`,marginBottom:20}}>
                <p style={{...sf,fontSize:18,color:T.bone,textTransform:'uppercase',margin:'0 0 4px'}}>{cancelModal.service_name}</p>
                <p style={{...mono,fontSize:11,color:T.blood,margin:'0 0 10px'}}>✂ {cancelModal.barber_name}</p>
                <div style={{display:'flex',gap:16}}>
                  <div>
                    <p style={{...mono,fontSize:8,color:T.deep,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:2}}>Date</p>
                    <p style={{...sf,fontSize:13,color:T.bone2,margin:0}}>{fmtDate(cancelModal.date)}</p>
                  </div>
                  <div>
                    <p style={{...mono,fontSize:8,color:T.deep,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:2}}>Time</p>
                    <p style={{...sf,fontSize:13,color:T.bone2,margin:0}}>{fmtTime(cancelModal.time)}</p>
                  </div>
                </div>
              </div>
              {/* buttons */}
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>!cancelling&&setCancelModal(null)} disabled={cancelling}
                  style={{flex:1,padding:'13px 16px',...rub,fontSize:14,letterSpacing:'.08em',textTransform:'uppercase',background:'transparent',color:T.dim,border:`2px solid ${T.bone3}`,borderRadius:PILL,cursor:'pointer',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.bone2;e.currentTarget.style.color=T.bone}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.color=T.dim}}>
                  Keep It
                </button>
                <button onClick={doCancel} disabled={cancelling}
                  style={{flex:1,padding:'13px 16px',...rub,fontSize:14,letterSpacing:'.08em',textTransform:'uppercase',background:cancelling?T.bloodDim:T.blood,color:T.bone,border:`2px solid ${T.bone}`,borderRadius:PILL,cursor:cancelling?'not-allowed':'pointer',transition:'all .2s',boxShadow:cancelling?'none':`3px 3px 0 ${T.bone3}`}}
                  onMouseEnter={e=>{if(!cancelling){e.currentTarget.style.background=T.blood2;e.currentTarget.style.transform='scale(1.03)'}}}
                  onMouseLeave={e=>{if(!cancelling){e.currentTarget.style.background=T.blood;e.currentTarget.style.transform='none'}}}>
                  {cancelling ? (
                    <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                      <span style={{width:12,height:12,border:`2px solid rgba(232,223,200,.3)`,borderTopColor:T.bone,borderRadius:'50%',display:'inline-block',animation:'rhSpin .7s linear infinite'}}/>
                      Cancelling...
                    </span>
                  ) : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        body{background:${T.ink};color:${T.bone}}
        @keyframes rhFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes rhFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes rhSpin{to{transform:rotate(360deg)}}
        @keyframes rhShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes rhPop{0%{opacity:0;transform:scale(.85) rotate(-3deg)}60%{transform:scale(1.04) rotate(.5deg)}100%{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.bloodBorder};border-radius:4px}
      `}</style>

      {/* grid bg */}
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',backgroundImage:`linear-gradient(rgba(232,223,200,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(232,223,200,.012) 1px,transparent 1px)`,backgroundSize:'72px 72px'}}/>
      <div style={{position:'fixed',top:'-10%',left:'-5%',width:500,height:500,background:`radial-gradient(circle,rgba(139,26,26,.05) 0%,transparent 65%)`,pointerEvents:'none',zIndex:0}}/>

      {/* ── NAVBAR ── */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:`rgba(7,5,4,.96)`,backdropFilter:'blur(16px)',borderBottom:`3px solid ${T.bone3}`,height:64}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 max(16px,env(safe-area-inset-left))',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link to="/" style={{...sf,fontSize:18,letterSpacing:'.2em',textTransform:'uppercase',color:T.bone,textDecoration:'none',transition:'color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.color=T.blood}
            onMouseLeave={e=>e.currentTarget.style.color=T.bone}>
            Barbershopnearme
          </Link>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <span style={{...mono,fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:T.dim}}>✂ {user.name}</span>
            <button onClick={()=>{logout();navigate('/')}} style={{
              ...rub,fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',
              background:'transparent', color:T.dim,
              border:`2px solid ${T.bone3}`, borderRadius:PILL,
              padding:'7px 18px', cursor:'pointer', transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.color=T.blood;e.currentTarget.style.borderColor=T.bloodBorder;e.currentTarget.style.background=T.bloodDim}}
              onMouseLeave={e=>{e.currentTarget.style.color=T.dim;e.currentTarget.style.borderColor=T.bone3;e.currentTarget.style.background='transparent'}}
            >Sign Out</button>
          </div>
        </div>
      </nav>

      <div style={{position:'relative',zIndex:10,maxWidth:1100,margin:'0 auto',padding:'32px max(16px,env(safe-area-inset-left)) max(80px,calc(40px + env(safe-area-inset-bottom)))'}}>

        {/* ── HEADER ── */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:20,marginBottom:40,animation:'rhFadeUp .5s cubic-bezier(.16,1,.3,1) both'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{width:3,height:32,background:T.blood,borderRadius:4}}/>
              <p style={{...mono,fontSize:9,color:T.blood,letterSpacing:'.5em',textTransform:'uppercase',margin:0}}>Client Portal</p>
            </div>
            <h1 style={{...sf,fontSize:'clamp(36px,6vw,62px)',lineHeight:.88,letterSpacing:'.03em',textTransform:'uppercase',color:T.bone,margin:0}}>
              Your<br/><span style={{color:T.blood}}>Appointments_</span>
            </h1>
          </div>

          {/* stats pills */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {[
              {label:'Upcoming', val:upcoming.length, color:T.green,   bg:T.greenDim,  border:T.greenBorder},
              {label:'All Time', val:appts.length,    color:T.bone2,   bg:T.deep,      border:T.bone3},
            ].map(({label,val,color,bg,border})=>(
              <div key={label} style={{padding:'10px 18px',background:bg,border:`2px solid ${border}`,borderRadius:PILL,textAlign:'center'}}>
                <p style={{...sf,fontSize:24,color,margin:0,lineHeight:1}}>{val}</p>
                <p style={{...mono,fontSize:8,color:T.deep,letterSpacing:'.2em',textTransform:'uppercase',marginTop:3}}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOOK CTA ── */}
        <div style={{marginBottom:36}}>
          <button onClick={()=>navigate('/portal')} style={{
            ...rub, fontSize:16, letterSpacing:'.12em', textTransform:'uppercase',
            background:T.blood, color:T.bone, border:`3px solid ${T.bone}`,
            borderRadius:PILL, padding:'13px 34px', cursor:'pointer',
            boxShadow:`5px 5px 0 ${T.bone3}`, transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
            display:'inline-flex', alignItems:'center', gap:10,
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05) rotate(-.4deg)';e.currentTarget.style.background=T.blood2;e.currentTarget.style.boxShadow=`7px 7px 0 ${T.bone3}`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.background=T.blood;e.currentTarget.style.boxShadow=`5px 5px 0 ${T.bone3}`}}
          >
            <ScissorsIcon size={18} color={T.bone}/>
            Book New Appointment
          </button>
        </div>

        {/* ── TABS ── */}
        <div style={{display:'flex',gap:4,marginBottom:32,borderBottom:`2px solid ${T.bone3}`,paddingBottom:0}}>
          {[['upcoming',`Upcoming (${upcoming.length})`],['past',`Past (${past.length})`]].map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{
              ...rub,fontSize:15,letterSpacing:'.1em',textTransform:'uppercase',
              background:'transparent', color: tab===key ? T.bone : T.dim,
              border:'none', borderBottom: tab===key ? `3px solid ${T.blood}` : '3px solid transparent',
              padding:'10px 24px 14px', cursor:'pointer', transition:'all .2s',
              marginBottom:'-2px',
            }}
              onMouseEnter={e=>{if(tab!==key)e.currentTarget.style.color=T.bone2}}
              onMouseLeave={e=>{if(tab!==key)e.currentTarget.style.color=T.dim}}
            >{label}</button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(340px,100%),1fr))',gap:16}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{height:200,borderRadius:RH[i%4],background:`linear-gradient(90deg,rgba(232,223,200,.02) 25%,rgba(232,223,200,.05) 50%,rgba(232,223,200,.02) 75%)`,backgroundSize:'200% 100%',animation:'rhShimmer 1.5s infinite'}}/>
            ))}
          </div>
        ) : shown.length===0 ? (
          <EmptyState tab={tab} onBook={()=>navigate('/portal')}/>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(340px,100%),1fr))',gap:18,animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both'}}>
            {shown.map((a,i)=><ApptCard key={a.id} appt={a} onCancel={onCancel} onRequestCancel={requestCancel} i={i}/>)}
          </div>
        )}
      </div>
    </div>
  )
}
