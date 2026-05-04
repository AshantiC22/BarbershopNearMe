import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import PortalTransition from '@/components/ui/PortalTransition.jsx'
import api from '@/services/api.js'

/* ══════════ RUBBER HOSE DECORATIONS ══════════ */
function AnimatedScissors({ size=64, delay=0 }){
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none"
      style={{ animation:`floatBob 3s ease-in-out ${delay}s infinite`, filter:'drop-shadow(3px 3px 0 #8B1A1A)' }}>
      <circle cx="16" cy="16" r="11" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="16" r="5" fill="#8B1A1A"/>
      <circle cx="16" cy="56" r="11" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="56" r="5" fill="#8B1A1A"/>
      <path d="M25 23 L70 68" stroke="#E8DFC8" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M25 55 L70 10" stroke="#E8DFC8" strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx="47" cy="39" r="5.5" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2.5"/>
    </svg>
  )
}

function BarberPole({ height=180 }){
  return (
    <div style={{ width:34, height, borderRadius:'22px 18px 22px 18px', border:'3px solid #E8DFC8', overflow:'hidden', flexShrink:0, boxShadow:'3px 3px 0 rgba(139,26,26,.4)', position:'relative' }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:5,background:'#E8DFC8',zIndex:2 }}/>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:5,background:'#E8DFC8',zIndex:2 }}/>
      <div style={{ width:'100%', height:352, background:'repeating-linear-gradient(180deg,#E8DFC8 0px,#E8DFC8 18px,#111 18px,#111 36px,#8B1A1A 36px,#8B1A1A 54px)', animation:'authPole 3s linear infinite' }}/>
    </div>
  )
}

function SpinningStar({ size=14, color='#8B1A1A', duration=2.5, delay=0 }){
  return (
    <svg width={size} height={size} viewBox="0 0 14 14"
      style={{ animation:`authSpin ${duration}s linear ${delay}s infinite`, flexShrink:0 }}>
      <polygon points="7,0 8.7,5 14,5 9.8,8 11.4,13 7,10 2.6,13 4.2,8 0,5 5.3,5" fill={color}/>
    </svg>
  )
}

function WobblyDivider(){
  return (
    <svg width="100%" height="12" viewBox="0 0 300 12" preserveAspectRatio="none"
      style={{ display:'block', margin:'20px 0', opacity:.2 }}>
      <path d="M0 6 C30 2,60 10,90 6 C120 2,150 10,180 6 C210 2,240 10,270 6 C285 3,293 8,300 6"
        stroke="#E8DFC8" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function InkSplat({ style={} }){
  return (
    <svg width="120" height="120" viewBox="0 0 60 60" fill="none"
      style={{ position:'absolute', pointerEvents:'none', userSelect:'none', opacity:.04, ...style }}>
      <path d="M30 4C36 2,42 8,44 14C50 10,56 16,54 22C60 24,60 32,54 34C58 40,54 48,48 48C50 54,44 58,38 54C36 60,28 60,26 54C20 58,14 54,16 48C10 48,6 40,10 34C4 32,4 24,10 22C8 16,14 10,20 14C22 8,26 2,30 4Z"
        fill="#8B1A1A"/>
    </svg>
  )
}

/* ══════════ SHARED FIELD ══════════ */
function Field({ label, type='text', value, onChange, placeholder, autoFocus, note }){
  const [focused, setFocused] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const isPw = type === 'password'
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
        <label style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.28em', textTransform:'uppercase', color:focused?'#8B1A1A':'rgba(232,223,200,.45)', transition:'color .2s' }}>
          {focused?'▸ ':''}{label}
        </label>
        {note && <span style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, color:'rgba(232,223,200,.2)' }}>{note}</span>}
      </div>
      <div style={{ position:'relative' }}>
        <input
          type={isPw ? (showPw?'text':'password') : type}
          value={value} onChange={onChange}
          placeholder={placeholder} autoFocus={autoFocus}
          style={{
            width:'100%', background:focused?'#120D09':'#0C0906',
            border:'none', borderBottom:`3px solid ${focused?'#8B1A1A':'rgba(232,223,200,.14)'}`,
            borderRadius:focused?'6px 10px 0 0':'4px 8px 0 0',
            color:'#E8DFC8', fontFamily:"'Courier Prime',monospace",
            fontSize:15, padding:'12px 40px 12px 14px',
            outline:'none', transition:'all .2s', letterSpacing:'.04em',
          }}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        />
        {isPw && (
          <button type="button" onClick={()=>setShowPw(v=>!v)} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'rgba(232,223,200,.75)',
            padding:4, transition:'color .2s',
          }}
            onMouseEnter={e=>e.currentTarget.style.color='#8B1A1A'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(232,223,200,.75)'}
          >
            {showPw ? '🙈' : '👁'}
          </button>
        )}
        {focused && <div style={{ position:'absolute', bottom:-3, right:0, width:10, height:10, background:'#8B1A1A', borderRadius:'50% 50% 0 50%' }}/>}
      </div>
    </div>
  )
}

/* ══════════ SUBMIT BUTTON ══════════ */
function SubmitBtn({ loading, children }){
  const [hov, setHov] = useState(false)
  const [press, setPress] = useState(false)
  return (
    <button type="submit" disabled={loading} style={{
      width:'100%', marginTop:8,
      fontFamily:"'Boogaloo',cursive", fontSize:19, letterSpacing:'.14em', textTransform:'uppercase',
      background:loading?'#5C0E0E':'#8B1A1A', color:'#E8DFC8',
      border:'3px solid #E8DFC8',
      borderRadius:'10px 16px 8px 16px / 16px 8px 16px 10px',
      padding:'15px 32px',
      boxShadow:press?'1px 2px 0 #E8DFC8':hov?'7px 8px 0 #E8DFC8':'5px 6px 0 #E8DFC8',
      cursor:loading?'not-allowed':'pointer',
      transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
      transform:press?'scale(.94)':hov?'scale(1.04) rotate(-.5deg)':'scale(1)',
      opacity:loading?.65:1,
    }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>{setHov(false);setPress(false)}}
      onMouseDown={()=>setPress(true)} onMouseUp={()=>setPress(false)}
    >{children}</button>
  )
}

/* ══════════ SHARED LAYOUT ══════════ */
function AuthLayout({ title, subtitle, onSubmit, children, switchText, switchLink, switchLabel, error, extraLinks }){
  return (
    <div style={{ minHeight:'100vh', background:'#070504', display:'flex', overflow:'hidden', position:'relative' }}>
      <style>{`
        @keyframes authPole{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-162px,0)}}
        @keyframes authSpin{to{transform:rotate(360deg)}}
        @keyframes floatBob{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(3deg)}}
        @keyframes floatBobReverse{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px) rotate(-3deg)}}
        @keyframes authWiggle{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
        @keyframes authFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes authGridMove{0%{transform:translate(0,0)}50%{transform:translate(4px,4px)}100%{transform:translate(0,0)}}
        .auth-left{display:flex}
        @media(max-width:860px){.auth-left{display:none!important}}
      `}</style>

      {/* LEFT PANEL */}
      <div className="auth-left" style={{ width:440, flexShrink:0, background:'#0A0706', borderRight:'3px solid rgba(232,223,200,.22)', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 40px', gap:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(139,26,26,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,26,26,.04) 1px,transparent 1px)', backgroundSize:'36px 36px', animation:'authGridMove 8s ease-in-out infinite' }}/>
        <InkSplat style={{ top:'5%', left:'10%', transform:'rotate(12deg)' }}/>
        <InkSplat style={{ bottom:'15%', right:'5%', transform:'rotate(-20deg)', opacity:.05 }}/>

        <div style={{ textAlign:'center', position:'relative' }}>
          <AnimatedScissors size={68} delay={0}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(232,223,200,.55)', marginTop:14 }}>Barbershopnearme</div>
          <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(232,223,200,.60)', marginTop:4 }}>Est. 1931 · Hattiesburg, MS</div>
        </div>

        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(44px,6.5vw,68px)', lineHeight:.9, letterSpacing:'.02em', textTransform:'uppercase', color:'#E8DFC8', textAlign:'center', textShadow:'5px 5px 0 #8B1A1A', animation:'authWiggle 5s ease-in-out infinite', position:'relative' }}>
          The Chair<br/><span style={{ color:'#8B1A1A' }}>Awaits</span><br/>You.
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, position:'relative', width:'100%' }}>
          <BarberPole height={130}/>
          <svg width="110" height="28" viewBox="0 0 100 28" fill="none" style={{ animation:'floatBobReverse 4s ease-in-out 1s infinite' }}>
            <rect x="0" y="8" width="32" height="12" rx="4" fill="#1a1410" stroke="#E8DFC8" strokeWidth="2"/>
            <path d="M32 4 L82 14 L32 24 L36 14 Z" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2"/>
            <path d="M82 14 L100 14" stroke="#E8DFC8" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:1, background:'rgba(232,223,200,.2)' }}/>
            <SpinningStar color="#8B1A1A" duration={2.5}/>
            <SpinningStar color="#E8DFC8" duration={3.5} delay={.6} size={18}/>
            <SpinningStar color="#8B1A1A" duration={2.8} delay={1}/>
            <div style={{ width:44, height:1, background:'rgba(232,223,200,.2)' }}/>
          </div>
        </div>

        {/* barber portal link on left panel */}
        <Link to="/barber-login" style={{ fontFamily:"'Boogaloo',cursive", fontSize:12, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(232,223,200,.65)', textDecoration:'none', border:'2px solid rgba(232,223,200,.24)', borderRadius:50, padding:'6px 18px', transition:'all .2s', position:'relative' }}
          onMouseEnter={e=>{e.currentTarget.style.color='#8B1A1A';e.currentTarget.style.borderColor='rgba(139,26,26,.4)'}}
          onMouseLeave={e=>{e.currentTarget.style.color='rgba(232,223,200,.65)';e.currentTarget.style.borderColor='rgba(232,223,200,.24)'}}>
          ✂ Barber Portal
        </Link>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', position:'relative', overflow:'hidden', minWidth:0 }}>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle,rgba(232,223,200,.022) 1px,transparent 1px)', backgroundSize:'18px 18px' }}/>
        <div style={{ position:'absolute', top:'-20%', right:'-8%', width:'45%', height:'140%', background:'repeating-linear-gradient(170deg,transparent,transparent 50px,rgba(139,26,26,.04) 50px,rgba(139,26,26,.04) 51px)', pointerEvents:'none' }}/>

        <div style={{ width:'100%', maxWidth:420, position:'relative', animation:'authFadeUp .6s cubic-bezier(.16,1,.3,1) both' }}>
          {/* mobile logo */}
          <div style={{ display:'none', textAlign:'center', marginBottom:28 }} className="auth-mobile-logo">
            <style>{`.auth-mobile-logo{display:none!important}@media(max-width:860px){.auth-mobile-logo{display:block!important}}`}</style>
            <AnimatedScissors size={48}/>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.5)', marginTop:10 }}>Barbershopnearme</div>
          </div>

          {/* FORM CARD */}
          <div style={{ background:'#0F0B09', border:'3px solid rgba(232,223,200,.22)', borderTop:'4px solid #8B1A1A', borderRadius:'2px 16px 12px 12px', padding:'36px 32px', boxShadow:'7px 7px 0 rgba(139,26,26,.22), 0 24px 60px rgba(0,0,0,.6)', position:'relative', overflow:'hidden' }}>
            <InkSplat style={{ top:'-20px', right:'-20px', transform:'rotate(25deg)', opacity:.06 }}/>
            <div style={{ position:'absolute', top:-2, right:24, width:14, height:14, background:'#8B1A1A', borderRadius:'50% 50% 50% 0' }}/>
            <div style={{ position:'absolute', top:-2, right:44, width:8, height:8, background:'rgba(139,26,26,.4)', borderRadius:'50% 50% 50% 0' }}/>

            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:12, letterSpacing:'.18em', textTransform:'uppercase', color:'#8B1A1A', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                <SpinningStar size={10} duration={3}/>Client Portal<SpinningStar size={10} duration={3} delay={.5} color="#E8DFC8"/>
              </div>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, letterSpacing:'.06em', textTransform:'uppercase', color:'#E8DFC8', lineHeight:1, marginBottom:6, textShadow:'3px 3px 0 rgba(139,26,26,.4)' }}>{title}</h1>
              <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.75)' }}>{subtitle}</p>
              <WobblyDivider/>
            </div>

            {error && (
              <div style={{ background:'rgba(139,26,26,.15)', border:'2px solid rgba(139,26,26,.4)', borderLeft:'4px solid #8B1A1A', borderRadius:'0 8px 8px 0', padding:'10px 14px', marginBottom:18, fontFamily:"'Courier Prime',monospace", fontSize:12, color:'#ff8888', letterSpacing:'.05em', animation:'authFadeUp .3s ease both' }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={onSubmit}>{children}</form>

            {/* extra links (forgot password etc) */}
            {extraLinks && <div style={{ marginTop:16 }}>{extraLinks}</div>}

            <div style={{ marginTop:22, paddingTop:18, borderTop:'2px solid rgba(232,223,200,.07)', textAlign:'center', fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.12em', color:'rgba(232,223,200,.65)' }}>
              {switchText}{' '}
              <Link to={switchLink} style={{ color:'#8B1A1A', textDecoration:'none', fontFamily:"'Boogaloo',cursive", fontSize:14, letterSpacing:'.1em' }}
                onMouseEnter={e=>e.target.style.color='#C43030'}
                onMouseLeave={e=>e.target.style.color='#8B1A1A'}
              >{switchLabel}</Link>
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:18 }}>
            <Link to="/" style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.25em', textTransform:'uppercase', color:'rgba(232,223,200,.2)', textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='rgba(232,223,200,.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(232,223,200,.2)'}
            >← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════ FORGOT PASSWORD PAGE ══════════ */
export function ForgotPasswordPage(){
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if(!username.trim() && !email.trim()){ setError('Enter your username or email.'); return }
    setLoading(true)
    try {
      await api.post('/password-reset/', { username: username.trim(), email: email.trim() })
      setSent(true)
    } catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  if(sent) return (
    <div style={{ minHeight:'100vh', background:'#070504', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:420 }}>
        <div style={{ fontSize:56, marginBottom:20, animation:'floatBob 3s ease-in-out infinite' }}>✉️</div>
        <style>{`@keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#E8DFC8', textShadow:'3px 3px 0 #8B1A1A', marginBottom:12 }}>Check Your Email</h1>
        <p style={{ fontFamily:"'Courier Prime',monospace", fontSize:13, color:'rgba(232,223,200,.55)', marginBottom:28, lineHeight:1.8 }}>If that account exists, a reset link is on its way. Check your spam folder too.</p>
        <Link to="/login" style={{ fontFamily:"'Boogaloo',cursive", fontSize:16, letterSpacing:'.12em', textTransform:'uppercase', background:'#8B1A1A', color:'#E8DFC8', border:'3px solid #E8DFC8', borderRadius:50, padding:'12px 32px', textDecoration:'none', boxShadow:'4px 4px 0 #E8DFC8' }}>Back to Sign In</Link>
      </div>
    </div>
  )

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your username or email"
      onSubmit={handleSubmit}
      switchText="Remember your password?"
      switchLink="/login"
      switchLabel="Sign In →"
      error={error}
    >
      <Field label="Username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" autoFocus note="or email below"/>
      <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
      <SubmitBtn loading={loading}>✉ Send Reset Link</SubmitBtn>
    </AuthLayout>
  )
}

/* ══════════ LOGIN PAGE ══════════ */
export function LoginPage(){
  const { login, loading, clearError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const returnTo  = location.state?.returnTo || '/dashboard'
  const preBarber = location.state?.barber   || null
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [showTrans,setTrans]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); clearError()
    try { await login(username.trim(), password); setTrans(true) }
    catch(err){ setError(err.message) }
  }

  if(showTrans) return <PortalTransition onDone={() =>
    navigate(returnTo, preBarber ? { state: { barber: preBarber } } : undefined)
  }/>

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your client portal"
      onSubmit={handleSubmit}
      switchText="Don't have an account?"
      switchLink="/signup"
      switchLabel="Sign Up →"
      error={error}
      extraLinks={
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <Link to="/forgot-password" style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.65)', textDecoration:'none', transition:'color .2s' }}
            onMouseEnter={e=>e.target.style.color='#8B1A1A'}
            onMouseLeave={e=>e.target.style.color='rgba(232,223,200,.65)'}
          >Forgot password?</Link>
          <Link to="/barber-login" style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.65)', textDecoration:'none', transition:'color .2s' }}
            onMouseEnter={e=>e.target.style.color='#8B1A1A'}
            onMouseLeave={e=>e.target.style.color='rgba(232,223,200,.65)'}
          >Barber portal →</Link>
        </div>
      }
    >
      <Field label="Username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" autoFocus/>
      <Field label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
      <SubmitBtn loading={loading}>✂ Sign In</SubmitBtn>
    </AuthLayout>
  )
}

/* ══════════ SIGNUP PAGE ══════════ */
export function SignupPage(){
  const { signup, loading, clearError } = useAuth()
  const navigate = useNavigate()
  const [name,     setName]     = useState('')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [showTrans,setTrans]    = useState(false)

  /* auto-generate username from name */
  const handleNameChange = (e) => {
    setName(e.target.value)
    setUsername(e.target.value.trim().replace(/\s+/g,'_').toLowerCase())
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); clearError()
    if(password !== confirm){ setError("Passwords don't match."); return }
    try { await signup(name, email, password, username); setTrans(true) }
    catch(err){ setError(err.message) }
  }

  const location_s  = useLocation()
  const returnTo_s  = location_s.state?.returnTo || '/portal'
  const preBarber_s = location_s.state?.barber   || null
  if(showTrans) return <PortalTransition onDone={() =>
    navigate(returnTo_s, preBarber_s ? { state: { barber: preBarber_s } } : undefined)
  }/>

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Book your first appointment today"
      onSubmit={handleSubmit}
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign In →"
      error={error}
      extraLinks={
        <Link to="/barber-login" style={{ fontFamily:"'Courier Prime',monospace", fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.65)', textDecoration:'none' }}
          onMouseEnter={e=>e.target.style.color='#8B1A1A'}
          onMouseLeave={e=>e.target.style.color='rgba(232,223,200,.65)'}
        >Are you a barber? Barber portal →</Link>
      }
    >
      <Field label="Full Name" value={name} onChange={handleNameChange} placeholder="Jack Pepper" autoFocus/>
      <Field label="Username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="jack_pepper" note="auto-generated"/>
      <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
      <Field label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/>
      <Field label="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••"/>
      <SubmitBtn loading={loading}>✂ Create Account</SubmitBtn>
    </AuthLayout>
  )
}
