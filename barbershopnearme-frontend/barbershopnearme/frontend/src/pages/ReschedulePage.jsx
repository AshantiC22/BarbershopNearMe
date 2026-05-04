import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

/* ─── tokens ─────────────────────────────────────── */
const T = {
  ink:'#070504', ink2:'#0F0B09',
  bone:'#E8DFC8', bone2:'rgba(232,223,200,.55)', bone3:'rgba(232,223,200,.22)',
  blood:'#8B1A1A', blood2:'#6B0F0F', bloodDim:'rgba(139,26,26,.18)', bloodBorder:'rgba(139,26,26,.4)',
  green:'#4ade80', greenDim:'rgba(74,222,128,.12)', greenBorder:'rgba(74,222,128,.3)',
  red:'#f87171', redDim:'rgba(248,113,113,.08)', redBorder:'rgba(248,113,113,.3)',
  gold:'#C8A840', goldDim:'rgba(200,168,64,.12)', goldBorder:'rgba(200,168,64,.3)',
  dim:'rgba(232,223,200,.38)', deep:'rgba(232,223,200,.24)',
}
const sf   = { fontFamily:"'Bebas Neue',sans-serif" }
const rub  = { fontFamily:"'Boogaloo',cursive" }
const mono = { fontFamily:"'Courier Prime',monospace" }
const RH   = ['14px 8px 12px 10px / 10px 12px 8px 14px','8px 14px 10px 12px / 12px 8px 14px 10px']
const PILL = '50px 46px 50px 44px / 44px 50px 46px 50px'

const ScissorsIcon = ({size=48,color=T.blood})=>(
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="3.5"/>
    <circle cx="16" cy="56" r="10" stroke={color} strokeWidth="3.5"/>
    <line x1="24" y1="22" x2="66" y2="64" stroke={color} strokeWidth="4" strokeLinecap="round"/>
    <line x1="24" y1="50" x2="66" y2="8"  stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

const STATES = {
  loading:  { icon:null,   color:T.blood,  title:'Processing Request',    sub:'Please wait a moment...',                                                         accent:T.bloodBorder },
  accepted: { icon:'✓',    color:T.green,  title:'Reschedule Approved',   sub:'The client has been notified and their appointment has been updated.',             accent:T.greenBorder },
  rejected: { icon:'✕',    color:T.red,    title:'Reschedule Declined',   sub:"The client has been notified. Their original appointment time remains unchanged.", accent:T.redBorder },
  already:  { icon:'!',    color:T.gold,   title:'Already Handled',       sub:'This reschedule request has already been responded to.',                          accent:T.goldBorder },
  invalid:  { icon:'?',    color:T.dim,    title:'Invalid Link',          sub:'This link is invalid or has expired. Contact the shop if you need help.',          accent:T.deep },
  error:    { icon:'✕',    color:T.red,    title:'Something Went Wrong',  sub:'Could not process the request. Try from your dashboard or contact the shop.',      accent:T.redBorder },
}

export default function ReschedulePage(){
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [details, setDetails] = useState(null)

  useEffect(()=>{
    const token  = searchParams.get('token')
    const action = searchParams.get('action')

    if(!token || !['accept','reject'].includes(action)){
      setStatus('invalid'); return
    }

    fetch(`/api/reschedule/respond/?token=${token}&action=${action}`,{
      method:'GET', headers:{'Content-Type':'application/json'},
    })
      .then(async res=>{
        const data = await res.json()
        if(data.status==='accepted')         { setStatus('accepted'); setDetails(data) }
        else if(data.status==='rejected')    { setStatus('rejected'); setDetails(data) }
        else if(data.status==='already_handled') setStatus('already')
        else                                 setStatus('error')
      })
      .catch(()=>setStatus('error'))
  },[])

  const cfg = STATES[status] || STATES.loading
  const isLoading = status==='loading'

  return (
    <div style={{minHeight:'100vh',background:T.ink,color:T.bone,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,position:'relative',fontFamily:"'Courier Prime',monospace"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.ink};}
        @keyframes rhSpin{to{transform:rotate(360deg)}}
        @keyframes rhFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes rhFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes rhPulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes rhPop{0%{opacity:0;transform:scale(.8) rotate(-4deg)}60%{transform:scale(1.05) rotate(1deg)}100%{opacity:1;transform:none}}
      `}</style>

      {/* grid bg */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',backgroundImage:`linear-gradient(rgba(232,223,200,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(232,223,200,.012) 1px,transparent 1px)`,backgroundSize:'72px 72px'}}/>
      <div style={{position:'fixed',top:'-8%',right:'-4%',width:500,height:500,background:`radial-gradient(circle,${T.bloodDim} 0%,transparent 65%)`,pointerEvents:'none'}}/>

      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:480,animation:'rhFadeUp .5s cubic-bezier(.16,1,.3,1) both'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40,animation:'rhFloat 4s ease-in-out infinite'}}>
          <ScissorsIcon size={56} color={isLoading?T.bloodBorder:cfg.color}/>
        </div>
        <p style={{...sf,fontSize:18,letterSpacing:'.2em',textTransform:'uppercase',color:T.bone2,textAlign:'center',marginBottom:40}}>Barbershopnearme</p>

        {/* card */}
        <div style={{
          background:T.ink2, border:`2px solid ${cfg.accent}`,
          borderRadius:RH[0],
          boxShadow:`6px 6px 0 ${T.blood2}, 0 0 40px ${T.bloodDim}`,
          overflow:'hidden',
          animation:'rhPop .5s cubic-bezier(.34,1.56,.64,1) .1s both',
        }}>
          {/* top gradient bar */}
          <div style={{height:4,background:`linear-gradient(to right,${cfg.color},${cfg.color}44,transparent)`}}/>

          <div style={{padding:'28px 28px 24px'}}>
            {/* icon */}
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
              <div style={{
                width:56,height:56,borderRadius:RH[1],flexShrink:0,
                background:isLoading?T.bloodDim:`${cfg.color}18`,
                border:`2px solid ${cfg.accent}`,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {isLoading
                  ? <div style={{width:22,height:22,border:`2px solid ${T.bloodBorder}`,borderTopColor:T.blood,borderRadius:'50%',animation:'rhSpin .9s linear infinite'}}/>
                  : <span style={{...sf,fontSize:26,color:cfg.color}}>{cfg.icon}</span>
                }
              </div>
              <div>
                <p style={{...sf,fontSize:26,color:T.bone,textTransform:'uppercase',letterSpacing:'.03em',margin:'0 0 3px',lineHeight:1}}>{cfg.title}</p>
                <p style={{...mono,fontSize:12,color:isLoading?T.deep:cfg.color,letterSpacing:'.2em',textTransform:'uppercase',margin:0,animation:isLoading?'rhPulse 1.5s ease infinite':'none'}}>
                  {isLoading?'processing...':status}
                </p>
              </div>
            </div>

            {/* subtext */}
            <p style={{...mono,fontSize:12,color:T.dim,lineHeight:1.75,marginBottom:details?20:0}}>{cfg.sub}</p>

            {/* appointment details if available */}
            {details && (
              <div style={{marginTop:16,padding:'14px 16px',background:T.ink,borderRadius:RH[0],border:`1px solid ${T.bone3}`}}>
                {details.service_name&&<div style={{marginBottom:8}}>
                  <p style={{...mono,fontSize:8,color:T.deep,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:2}}>Service</p>
                  <p style={{...sf,fontSize:16,color:T.bone,margin:0}}>{details.service_name}</p>
                </div>}
                {details.new_date&&<div style={{marginBottom:8}}>
                  <p style={{...mono,fontSize:8,color:status==='accepted'?T.green:T.deep,letterSpacing:'.3em',textTransform:'uppercase',marginBottom:2}}>
                    {status==='accepted'?'✓ New Confirmed Time':'Original Time (still active)'}
                  </p>
                  <p style={{...sf,fontSize:16,color:status==='accepted'?T.green:T.bone2,margin:0}}>{details.new_date} at {details.new_time}</p>
                </div>}
              </div>
            )}
          </div>

          {/* bottom section */}
          {!isLoading && (
            <div style={{borderTop:`1px dashed ${T.bone3}`,padding:'16px 28px 22px',display:'flex',gap:10,flexWrap:'wrap'}}>
              {status==='accepted'&&(
                <Link to="/barber-dashboard" style={{
                  flex:1,textAlign:'center',...rub,fontSize:14,letterSpacing:'.1em',textTransform:'uppercase',
                  background:T.green,color:'black',border:`2px solid black`,borderRadius:PILL,
                  padding:'12px 16px',textDecoration:'none',transition:'all .2s',
                  boxShadow:`3px 3px 0 ${T.greenBorder}`,display:'block',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.03)';e.currentTarget.style.background='#22c55e'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.background=T.green}}
                >Go to Dashboard</Link>
              )}
              {status==='rejected'&&(
                <Link to="/barber-dashboard" style={{
                  flex:1,textAlign:'center',...rub,fontSize:14,letterSpacing:'.1em',textTransform:'uppercase',
                  background:T.blood,color:T.bone,border:`2px solid ${T.bone}`,borderRadius:PILL,
                  padding:'12px 16px',textDecoration:'none',transition:'all .2s',
                  boxShadow:`3px 3px 0 ${T.bone3}`,display:'block',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.03)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none'}}
                >View Dashboard</Link>
              )}
              <Link to="/" style={{
                flex:1,textAlign:'center',...mono,fontSize:13,letterSpacing:'.2em',textTransform:'uppercase',
                background:'transparent',color:T.dim,border:`1px solid ${T.bone3}`,borderRadius:PILL,
                padding:'12px 16px',textDecoration:'none',transition:'all .2s',display:'block',
              }}
                onMouseEnter={e=>{e.currentTarget.style.color=T.bone;e.currentTarget.style.borderColor=T.bloodBorder}}
                onMouseLeave={e=>{e.currentTarget.style.color=T.dim;e.currentTarget.style.borderColor=T.bone3}}
              >← Home</Link>
            </div>
          )}
        </div>

        {/* address footer */}
        <p style={{...mono,fontSize:13,color:T.deep,textAlign:'center',marginTop:24,letterSpacing:'.15em'}}>
          📍 910 W Parker Rd Bld 300 · Plano, TX 75023
        </p>
      </div>
    </div>
  )
}
