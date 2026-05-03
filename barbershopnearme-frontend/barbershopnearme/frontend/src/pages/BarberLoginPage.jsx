import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/services/api.js'

/* ── palette ── */
const T = {
  ink:'#070504', ink2:'#0F0B09', bone:'#E8DFC8',
  blood:'#8B1A1A', blood2:'#6B0F0F',
  green:'rgba(74,222,128,1)', red:'rgba(248,113,113,1)',
  dim1:'rgba(232,223,200,.55)', dim2:'rgba(232,223,200,.14)',
}

/* ── canvas background ── */
function CanvasBg({ canvasRef }){
  useEffect(()=>{
    const cv = canvasRef.current
    if(!cv) return
    const ctx = cv.getContext('2d')
    let raf, t = 0
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      raf = requestAnimationFrame(draw); t += 0.008
      ctx.clearRect(0,0,cv.width,cv.height)
      const pts = [
        {x:.10,y:.20,s:60,r:t*.3},  {x:.85,y:.15,s:40,r:-t*.2},
        {x:.75,y:.70,s:50,r:t*.15}, {x:.15,y:.75,s:35,r:-t*.25},
        {x:.50,y:.10,s:30,r:t*.4},
      ]
      pts.forEach(({x,y,s,r})=>{
        ctx.save(); ctx.translate(x*cv.width, y*cv.height); ctx.rotate(r)
        ctx.globalAlpha=.05; ctx.strokeStyle=T.blood; ctx.lineWidth=1.5
        ctx.beginPath(); ctx.arc(0,-s*.4,s*.15,0,Math.PI*2); ctx.stroke()
        ctx.beginPath(); ctx.arc(0, s*.4,s*.15,0,Math.PI*2); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-s*.15,-s*.3); ctx.lineTo(s*.7,s*.6); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-s*.15, s*.3); ctx.lineTo(s*.7,-s*.2); ctx.stroke()
        ctx.restore()
      })
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return null
}

/* ── text field ── */
function Field({ label, type='text', value, onChange, onKeyDown, placeholder, error, pw, showPw, onTogglePw, note }){
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
      <div style={{ display:'flex',justifyContent:'space-between' }}>
        <label style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:error?T.red:focused?T.blood:T.dim1,transition:'color .2s' }}>
          {focused?'▸ ':''}{label}
        </label>
        {note && <span style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:'rgba(232,223,200,.2)' }}>{note}</span>}
      </div>
      <div style={{ position:'relative' }}>
        <input
          type={pw?(showPw?'text':'password'):type}
          value={value} onChange={onChange} onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width:'100%',background:focused?'rgba(232,223,200,.03)':T.ink2,
            border:`2px solid ${error?'rgba(248,113,113,.5)':focused?T.blood:T.dim2}`,
            borderRadius:'4px 8px 0 0',
            padding:pw?'12px 40px 12px 14px':'12px 14px',
            color:T.bone,fontFamily:"'Courier Prime',monospace",
            fontSize:15,outline:'none',transition:'all .2s',boxSizing:'border-box',
          }}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        />
        {pw && (
          <button type="button" onClick={onTogglePw} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:T.dim1,padding:4 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {showPw
                ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
            </svg>
          </button>
        )}
      </div>
      {error && <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.red,margin:0 }}>⚠ {error}</p>}
    </div>
  )
}

/* ── submit button ── */
function Btn({ loading, children, onClick, color=T.blood, textColor=T.bone }){
  return (
    <button onClick={onClick} disabled={loading} type="button" style={{
      width:'100%',padding:'14px',background:loading?T.ink2:color,color:textColor,
      fontFamily:"'Boogaloo',cursive",fontSize:16,letterSpacing:'.14em',textTransform:'uppercase',
      border:`2px solid ${loading?T.dim2:T.bone}`,borderRadius:'8px 12px 6px 12px',
      cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',
      justifyContent:'center',gap:10,transition:'all .2s',opacity:loading?.7:1,
    }}>
      {loading
        ? <><span style={{ width:14,height:14,border:`2px solid ${T.dim2}`,borderTopColor:T.dim1,borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Working...</>
        : children}
    </button>
  )
}

/* ═══════════════════════════════
   MAIN COMPONENT
═══════════════════════════════ */
export default function BarberLoginPage(){
  const navigate  = useNavigate()
  const canvasRef = useRef(null)

  const [mode,     setMode]     = useState('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [fieldErr, setFieldErr] = useState({})

  /* login */
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  /* signup */
  const [regName,   setRegName]   = useState('')
  const [regUser,   setRegUser]   = useState('')
  const [regEmail,  setRegEmail]  = useState('')
  const [regPass,   setRegPass]   = useState('')
  const [regPhone,  setRegPhone]  = useState('')
  const [regInvite, setRegInvite] = useState('')
  const [regSecQ,   setRegSecQ]   = useState('')
  const [regSecA,   setRegSecA]   = useState('')
  const [secQs,     setSecQs]     = useState([])

  /* recovery */
  const [recStep, setRecStep] = useState(1)
  const [recId,   setRecId]   = useState('')
  const [recUid,  setRecUid]  = useState(null)
  const [recName, setRecName] = useState('')
  const [recQ,    setRecQ]    = useState('')
  const [recA,    setRecA]    = useState('')
  const [recTok,  setRecTok]  = useState('')
  const [recNew,  setRecNew]  = useState('')
  const [recPw,   setRecPw]   = useState('')
  const [recShowPw, setRecShowPw] = useState(false)

  /* check existing valid session */
  useEffect(()=>{
    const tok = localStorage.getItem('bsnm_token')
    if(tok){
      try{
        const p = JSON.parse(atob(tok.split('.')[1]))
        if(p.is_staff && (!p.exp || p.exp * 1000 > Date.now())){
          navigate('/barber-dashboard', { replace:true })
          return
        }
      }catch{}
    }
    api.get('/security-questions/').then(d=>setSecQs(d.questions||[])).catch(()=>{})
  },[])

  const go = m => { setMode(m); setError(''); setSuccess(''); setFieldErr({}) }
  const resetRec = () => { setRecStep(1);setRecId('');setRecUid(null);setRecName('');setRecQ('');setRecA('');setRecTok('');setRecNew('');setRecPw('') }

  /* ── LOGIN ── */
  const doLogin = async() => {
    setError(''); setSuccess('')
    if(!user.trim()){ setError('Username is required.'); return }
    if(!pass)       { setError('Password is required.'); return }
    setLoading(true)
    try{
      const data = await api.post('/token/',{ username:user.trim(), password:pass })
      const p = JSON.parse(atob(data.access.split('.')[1]))
      if(!p.is_staff){ setError('Not a barber account. Use the client login instead.'); return }
      localStorage.setItem('bsnm_token',   data.access)
      localStorage.setItem('bsnm_refresh', data.refresh)
      localStorage.setItem('bsnm_user', JSON.stringify({ id:p.user_id, name:p.username, is_staff:true }))
      navigate('/barber-dashboard', { replace:true })
    }catch(e){ setError(e.message||'Wrong username or password.') }
    finally{ setLoading(false) }
  }

  /* ── SIGNUP ── */
  const doSignup = async() => {
    setError(''); setSuccess(''); setFieldErr({})
    const errs = {}
    if(!regName.trim())  errs.name   = 'Required'
    if(!regUser.trim())  errs.user   = 'Required'
    if(!regEmail.trim()) errs.email  = 'Required'
    if(!regPass||regPass.length<6) errs.pass = 'Min 6 chars'
    if(!regInvite.trim()) errs.invite = 'Required'
    if(Object.keys(errs).length){ setFieldErr(errs); return }
    setLoading(true)
    try{
      const res = await api.post('/barber/register/',{
        full_name:   regName.trim(),
        username:    regUser.trim(),
        email:       regEmail.trim(),
        password:    regPass,
        phone:       regPhone.trim() ? `+1${regPhone.trim()}` : '',
        invite_code: regInvite.trim(),
      })
      const tokens = res.access ? res : await api.post('/token/',{ username:regUser.trim(), password:regPass })
      const payload = JSON.parse(atob(tokens.access.split('.')[1]))
      localStorage.setItem('bsnm_token',   tokens.access)
      localStorage.setItem('bsnm_refresh', tokens.refresh)
      localStorage.setItem('bsnm_user', JSON.stringify({ id:payload.user_id, name:regName.trim(), is_staff:true }))
      if(regSecQ && regSecA.trim()){
        api.post('/security-question/set/',{ question:regSecQ, answer:regSecA }).catch(()=>{})
      }
      setSuccess('Account created! Going to your dashboard...')
      setTimeout(()=>navigate('/barber-dashboard',{replace:true}), 800)
    }catch(e){
      const d = e.response?.data || {}
      if(d.invite_code) setFieldErr(p=>({...p,invite:Array.isArray(d.invite_code)?d.invite_code[0]:d.invite_code}))
      else if(d.username) setFieldErr(p=>({...p,user:Array.isArray(d.username)?d.username[0]:d.username}))
      else if(d.email) setFieldErr(p=>({...p,email:Array.isArray(d.email)?d.email[0]:d.email}))
      else setError(e.message||'Registration failed.')
    }
    finally{ setLoading(false) }
  }

  /* ── RECOVERY ── */
  const doRec1 = async() => {
    setError(''); setLoading(true)
    try{
      const r = await api.post('/recovery/step1/',{ identifier:recId.trim() })
      setRecUid(r.user_id); setRecName(r.username); setRecQ(r.security_question)
      setRecStep(2)
    }catch(e){ setError(e.message||'Account not found.') }
    finally{ setLoading(false) }
  }
  const doRec2 = async() => {
    setError(''); setLoading(true)
    try{
      const r = await api.post('/recovery/step2/',{ user_id:recUid, answer:recA.trim() })
      setRecTok(r.token); setRecNew(recName); setRecStep(3)
      setSuccess('✓ Identity verified.')
    }catch(e){ setError(e.message||'Incorrect answer.') }
    finally{ setLoading(false) }
  }
  const doRec3 = async() => {
    setError(''); setLoading(true)
    if(!recPw && !recNew){ setError('Enter a new password or username.'); setLoading(false); return }
    try{
      await api.post('/recovery/step3/',{ user_id:recUid, token:recTok, new_password:recPw||undefined, new_username:recNew!==recName?recNew:undefined })
      setSuccess('✓ Updated! Sign in below.')
      setTimeout(()=>{ go('login'); resetRec() }, 1800)
    }catch(e){ setError(e.message||'Could not update.') }
    finally{ setLoading(false) }
  }

  /* ── STEP INDICATOR (recovery) ── */
  const StepDots = () => (
    <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12 }}>
      {[1,2,3].map(s=>(
        <div key={s} style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:recStep>s?T.green:recStep===s?T.blood:'transparent',border:`2px solid ${recStep>s?T.green:recStep===s?T.bone:T.dim2}`,transition:'all .3s' }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:12,color:T.bone }}>{recStep>s?'✓':s}</span>
          </div>
          {s<3 && <div style={{ width:18,height:2,background:recStep>s?T.green:T.dim2 }}/>}
        </div>
      ))}
      <span style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:T.dim1,marginLeft:4 }}>
        {recStep===1?'Find Account':recStep===2?'Verify Identity':'Reset Credentials'}
      </span>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:T.ink,position:'relative',overflow:'hidden' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes scandown{0%{top:0}100%{top:100%}}
        .bl-form{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px ${T.ink2} inset!important;-webkit-text-fill-color:${T.bone}!important}
      `}</style>

      {/* animated bg */}
      <canvas ref={canvasRef} style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none' }}/>
      <CanvasBg canvasRef={canvasRef}/>

      {/* grid */}
      <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',backgroundImage:`linear-gradient(${T.dim2} 1px,transparent 1px),linear-gradient(90deg,${T.dim2} 1px,transparent 1px)`,backgroundSize:'64px 64px',opacity:.5 }}/>

      {/* glow */}
      <div style={{ position:'fixed',top:'-20%',left:'50%',transform:'translateX(-50%)',width:800,height:500,background:'radial-gradient(ellipse,rgba(139,26,26,.08) 0%,transparent 65%)',pointerEvents:'none',zIndex:0 }}/>

      {/* scanline */}
      <div style={{ position:'fixed',inset:0,zIndex:1,pointerEvents:'none',overflow:'hidden' }}>
        <div style={{ position:'absolute',left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(139,26,26,.3),transparent)`,animation:'scandown 8s linear infinite' }}/>
      </div>

      {/* back link */}
      <Link to="/" style={{ position:'fixed',top:20,left:20,zIndex:20,fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.dim1,textDecoration:'none',letterSpacing:'.2em',textTransform:'uppercase',padding:'8px 14px',border:`1px solid ${T.dim2}`,background:'rgba(7,5,4,.85)',transition:'all .2s' }}
        onMouseEnter={e=>{e.currentTarget.style.color=T.blood;e.currentTarget.style.borderColor='rgba(139,26,26,.4)'}}
        onMouseLeave={e=>{e.currentTarget.style.color=T.dim1;e.currentTarget.style.borderColor=T.dim2}}>
        ← Home
      </Link>

      {/* centered card */}
      <div style={{ position:'relative',zIndex:10,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 16px' }}>
        <div style={{ width:'100%',maxWidth:480 }}>

          {/* card */}
          <div style={{ background:'rgba(7,5,4,.93)',border:`3px solid ${T.dim2}`,overflow:'hidden' }}>

            {/* header */}
            <div style={{ background:`linear-gradient(135deg,${T.blood},${T.blood2})`,padding:'20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div>
                <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:'rgba(232,223,200,.6)',letterSpacing:'.4em',textTransform:'uppercase',margin:'0 0 4px' }}>✂ Barber Portal</p>
                <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:'.15em',textTransform:'uppercase',color:T.bone,margin:0,lineHeight:1 }}>Barbershopnearme</h1>
              </div>
              <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
                <circle cx="16" cy="16" r="10" stroke={T.bone} strokeWidth="3"/>
                <circle cx="16" cy="56" r="10" stroke={T.bone} strokeWidth="3"/>
                <line x1="24" y1="22" x2="66" y2="64" stroke={T.bone} strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="24" y1="50" x2="66" y2="8"  stroke={T.bone} strokeWidth="3.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* tabs — hide on forgot */}
            {mode !== 'forgot' && (
              <div style={{ display:'flex',borderBottom:`2px solid ${T.dim2}` }}>
                {[['login','Sign In'],['signup','Join the Team']].map(([m,label])=>(
                  <button key={m} onClick={()=>go(m)} style={{
                    flex:1,padding:'12px 0',fontFamily:"'Boogaloo',cursive",fontSize:14,
                    letterSpacing:'.12em',textTransform:'uppercase',background:'transparent',
                    color:mode===m?T.blood:T.dim1,border:'none',
                    borderBottom:`3px solid ${mode===m?T.blood:'transparent'}`,
                    cursor:'pointer',transition:'all .2s',marginBottom:-2,
                  }}>{label}</button>
                ))}
              </div>
            )}

            {/* body */}
            <div style={{ padding:'24px 20px' }}>

              {/* alerts */}
              {error && (
                <div style={{ marginBottom:16,padding:'10px 14px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.25)',display:'flex',gap:8,alignItems:'flex-start' }}>
                  <span style={{ color:T.red,flexShrink:0 }}>⚠</span>
                  <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:11,color:T.red,margin:0 }}>{error}</p>
                </div>
              )}
              {success && (
                <div style={{ marginBottom:16,padding:'10px 14px',background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.25)',display:'flex',gap:8 }}>
                  <span style={{ color:T.green }}>✓</span>
                  <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:11,color:T.green,margin:0 }}>{success}</p>
                </div>
              )}

              {/* ═══ LOGIN ═══ */}
              {mode === 'login' && (
                <div className="bl-form" style={{ display:'flex',flexDirection:'column',gap:16 }}>
                  <Field label="Username" value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="barber_username"/>
                  <Field label="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="••••••••" pw showPw={showPw} onTogglePw={()=>setShowPw(v=>!v)}/>
                  <div style={{ textAlign:'right',marginTop:-4 }}>
                    <button onClick={()=>{go('forgot');resetRec()}} style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.dim1,background:'none',border:'none',cursor:'pointer',transition:'color .2s' }}
                      onMouseEnter={e=>e.target.style.color=T.blood}
                      onMouseLeave={e=>e.target.style.color=T.dim1}>
                      Forgot password?
                    </button>
                  </div>
                  <Btn loading={loading} onClick={doLogin}>Enter Dashboard →</Btn>
                  <div style={{ paddingTop:12,borderTop:`1px solid ${T.dim2}`,textAlign:'center' }}>
                    <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:'rgba(232,223,200,.2)',marginBottom:6 }}>Not on the team yet?</p>
                    <button onClick={()=>go('signup')} style={{ fontFamily:"'Boogaloo',cursive",fontSize:13,color:T.dim1,background:'none',border:'none',cursor:'pointer',letterSpacing:'.12em',textTransform:'uppercase',transition:'color .2s' }}
                      onMouseEnter={e=>e.target.style.color=T.blood}
                      onMouseLeave={e=>e.target.style.color=T.dim1}>
                      Create your account →
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ SIGNUP ═══ */}
              {mode === 'signup' && (
                <div className="bl-form" style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  <Field label="Full Name"  value={regName}   onChange={e=>setRegName(e.target.value)}   placeholder="Marcus Jones"      error={fieldErr.name}/>
                  <Field label="Username"   value={regUser}   onChange={e=>setRegUser(e.target.value)}   placeholder="marcus_cuts"       error={fieldErr.user}/>
                  <Field label="Email"      type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="you@email.com" error={fieldErr.email}/>

                  {/* phone */}
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <label style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:T.dim1 }}>Phone <span style={{ fontSize:8,color:'rgba(232,223,200,.2)' }}>(optional, for alerts)</span></label>
                    <div style={{ display:'flex',alignItems:'center',border:`2px solid ${T.dim2}`,borderRadius:'4px 8px 0 0',background:T.ink2 }}>
                      <span style={{ fontFamily:"'Courier Prime',monospace",fontSize:15,color:T.blood,padding:'12px 0 12px 14px',flexShrink:0 }}>+1</span>
                      <input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="6015551234" style={{ flex:1,background:'transparent',border:'none',padding:'12px 14px 12px 6px',color:T.bone,fontFamily:"'Courier Prime',monospace",fontSize:15,outline:'none' }}/>
                    </div>
                  </div>

                  <Field label="Password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Min 6 characters" error={fieldErr.pass} pw showPw={showPw} onTogglePw={()=>setShowPw(v=>!v)}/>

                  {/* invite code */}
                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <label style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:fieldErr.invite?T.red:T.blood }}>Invite Code</label>
                    <input type="text" value={regInvite} onChange={e=>setRegInvite(e.target.value.toUpperCase())} placeholder="BSNM2026" style={{ width:'100%',background:regInvite?'rgba(139,26,26,.05)':T.ink2,border:`2px solid ${fieldErr.invite?'rgba(248,113,113,.5)':regInvite?'rgba(139,26,26,.5)':'rgba(139,26,26,.25)'}`,borderRadius:'4px 8px 0 0',padding:'12px 14px',color:T.blood,fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:'.2em',outline:'none',boxSizing:'border-box' }}/>
                    {fieldErr.invite && <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:T.red,margin:0 }}>⚠ {fieldErr.invite}</p>}
                    {!fieldErr.invite && <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:'rgba(232,223,200,.2)',margin:0 }}>Provided by Barbershopnearme management · default: BSNM2026</p>}
                  </div>

                  {/* security question */}
                  <div style={{ paddingTop:10,borderTop:`1px solid ${T.dim2}` }}>
                    <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:T.dim1,marginBottom:8 }}>Security Question <span style={{ fontSize:8,color:'rgba(232,223,200,.2)' }}>(for account recovery)</span></p>
                    {secQs.length > 0 ? (
                      <select value={regSecQ} onChange={e=>setRegSecQ(e.target.value)} style={{ width:'100%',background:T.ink2,border:`2px solid ${T.dim2}`,borderRadius:'4px 8px 0 0',padding:'11px 12px',color:regSecQ?T.bone:T.dim1,fontSize:13,outline:'none',fontFamily:"'Courier Prime',monospace",marginBottom:10,boxSizing:'border-box' }}>
                        <option value="" disabled>Choose a question...</option>
                        {secQs.map(q=><option key={q} value={q}>{q}</option>)}
                      </select>
                    ) : (
                      <input value={regSecQ} onChange={e=>setRegSecQ(e.target.value)} placeholder="e.g. What is your mother's maiden name?" style={{ width:'100%',background:T.ink2,border:`2px solid ${T.dim2}`,borderRadius:'4px 8px 0 0',padding:'11px 14px',color:T.bone,fontFamily:"'Courier Prime',monospace",fontSize:13,outline:'none',marginBottom:10,boxSizing:'border-box' }}/>
                    )}
                    {regSecQ && <Field label="Your Answer" value={regSecA} onChange={e=>setRegSecA(e.target.value)} placeholder="Your answer (not case sensitive)"/>}
                  </div>

                  <Btn loading={loading} onClick={doSignup}>Join the Team →</Btn>
                </div>
              )}

              {/* ═══ FORGOT ═══ */}
              {mode === 'forgot' && (
                <div className="bl-form" style={{ display:'flex',flexDirection:'column',gap:16 }}>
                  <button onClick={()=>{go('login');resetRec()}} style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.dim1,background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0,transition:'color .2s' }}
                    onMouseEnter={e=>e.target.style.color=T.blood}
                    onMouseLeave={e=>e.target.style.color=T.dim1}>
                    ← Back to Sign In
                  </button>

                  <StepDots/>

                  <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:32,lineHeight:.9,textTransform:'uppercase',color:T.bone,textShadow:`3px 3px 0 ${T.blood}`,margin:0 }}>
                    {recStep===1?'Recover Account':recStep===2?'Verify Identity':'Reset Credentials'}
                  </h2>

                  {recStep===1 && <>
                    <Field label="Username or Email" value={recId} onChange={e=>setRecId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doRec1()} placeholder="Enter your username or email"/>
                    <Btn loading={loading} onClick={doRec1}>Find My Account →</Btn>
                  </>}

                  {recStep===2 && <>
                    <div style={{ padding:'12px 14px',background:'rgba(139,26,26,.05)',border:`1px solid rgba(139,26,26,.2)` }}>
                      <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.dim1,margin:'0 0 3px' }}>Account found</p>
                      <p style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:T.bone,margin:0 }}>{recName}</p>
                    </div>
                    <div style={{ padding:'12px 14px',background:'rgba(232,223,200,.02)',border:`1px solid ${T.dim2}` }}>
                      <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,color:T.bone,margin:0,lineHeight:1.6 }}>{recQ}</p>
                    </div>
                    <Field label="Your Answer" value={recA} onChange={e=>setRecA(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doRec2()} placeholder="Not case sensitive"/>
                    <Btn loading={loading} onClick={doRec2}>Verify Answer →</Btn>
                  </>}

                  {recStep===3 && <>
                    <div style={{ padding:'10px 14px',background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.2)' }}>
                      <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:11,color:T.green,margin:0 }}>✓ Identity verified — set new credentials</p>
                    </div>
                    <Field label="New Username (blank to keep)" value={recNew} onChange={e=>setRecNew(e.target.value)} placeholder={recName}/>
                    <Field label="New Password (blank to keep)" value={recPw} onChange={e=>setRecPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doRec3()} placeholder="Min 6 characters" pw showPw={recShowPw} onTogglePw={()=>setRecShowPw(v=>!v)}/>
                    <Btn loading={loading} onClick={doRec3} color={T.green} textColor="#050403">Save New Credentials ✓</Btn>
                  </>}
                </div>
              )}
            </div>

            {/* footer */}
            <div style={{ padding:'12px 20px 16px',borderTop:`1px solid ${T.dim2}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:9,color:'rgba(232,223,200,.2)',letterSpacing:'.2em',textTransform:'uppercase',margin:0 }}>✂ Barbers only</p>
              <Link to="/login" style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,color:T.blood,textDecoration:'none',transition:'color .2s' }}
                onMouseEnter={e=>e.target.style.color=T.bone}
                onMouseLeave={e=>e.target.style.color=T.blood}>
                Client login →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
