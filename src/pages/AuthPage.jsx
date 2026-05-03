import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import PortalTransition from '@/components/ui/PortalTransition.jsx'

/* ══════════════════════════════════════════════════════
   RUBBER HOSE SVG DECORATIONS
══════════════════════════════════════════════════════ */

/* Animated barber pole */
function BarberPole({ height = 200 }) {
  return (
    <div style={{
      width: 32, height, borderRadius: 16,
      border: '3px solid #E8DFC8', overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '400%',
        background: 'repeating-linear-gradient(180deg, #E8DFC8 0, #E8DFC8 18px, #111 18px, #111 36px, #8B1A1A 36px, #8B1A1A 54px)',
        animation: 'authPoleScroll 1.2s linear infinite',
      }}/>
    </div>
  )
}

/* Floating scissors */
function Scissors({ size = 56, delay = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none"
      style={{ animation: `authFloat 3s ease-in-out ${delay}s infinite`, flexShrink: 0 }}>
      <circle cx="16" cy="16" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <circle cx="16" cy="56" r="10" stroke="#E8DFC8" strokeWidth="3.5" fill="#070504"/>
      <line x1="24" y1="22" x2="66" y2="64" stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="66" y2="8"  stroke="#E8DFC8" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="4" fill="#8B1A1A"/>
      <circle cx="16" cy="56" r="4" fill="#8B1A1A"/>
      <circle cx="45" cy="36" r="4.5" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="2"/>
    </svg>
  )
}

/* Razor */
function Razor() {
  return (
    <svg width="120" height="24" viewBox="0 0 120 24" fill="none"
      style={{ animation: 'authFloat 4s ease-in-out 1s infinite' }}>
      <rect x="0" y="8" width="40" height="8" rx="2" fill="#E8DFC8" fillOpacity=".15"/>
      <rect x="2" y="10" width="36" height="4" rx="1" fill="#E8DFC8" fillOpacity=".25"/>
      <path d="M40 4 L80 12 L40 20 L44 12 Z" fill="#8B1A1A" stroke="#E8DFC8" strokeWidth="1.5"/>
      <rect x="80" y="9" width="36" height="6" rx="3" fill="#E8DFC8" fillOpacity=".2"/>
      <line x1="84" y1="12" x2="112" y2="12" stroke="#E8DFC8" strokeWidth="1.5" strokeOpacity=".4"/>
    </svg>
  )
}

/* Stars cluster */
function StarCluster() {
  const stars = [[10,10],[30,20],[50,8],[70,22],[22,34],[58,32],[80,14]]
  return (
    <svg width="90" height="44" viewBox="0 0 90 44" fill="none">
      {stars.map(([x,y],i) => (
        <path key={i} d={`M${x} ${y-5} L${x+1.5} ${y-1.5} L${x+5} ${y} L${x+1.5} ${y+1.5} L${x} ${y+5} L${x-1.5} ${y+1.5} L${x-5} ${y} L${x-1.5} ${y-1.5} Z`}
          fill={i%2===0?'#8B1A1A':'#E8DFC8'}
          style={{ animation:`authSpin ${2+i*.4}s linear ${i*.3}s infinite` }}
          transformOrigin={`${x}px ${y}px`}
        />
      ))}
    </svg>
  )
}

/* Ink splat behind form */
function InkSplat({ size = 300, opacity = 0.04 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" fill="none"
      style={{ position:'absolute', pointerEvents:'none', userSelect:'none' }}>
      <path d="M150 20 C180 10 220 30 240 60 C270 50 290 80 280 110 C310 120 310 160 280 170 C300 200 280 240 250 250 C260 280 230 300 200 290 C190 320 160 320 150 300 C140 320 110 320 100 290 C70 300 40 280 50 250 C20 240 0 200 20 170 C-10 160 -10 120 20 110 C10 80 30 50 60 60 C80 30 120 10 150 20Z"
        fill="#8B1A1A" opacity={opacity}/>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════
   SHARED FIELD COMPONENT
══════════════════════════════════════════════════════ */
function Field({ label, type='text', value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display:'block', fontFamily:"'Courier Prime',monospace",
        fontSize:10, letterSpacing:'.28em', textTransform:'uppercase',
        color: focused?'#8B1A1A':'rgba(232,223,200,.45)',
        marginBottom:8, transition:'color .2s',
      }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoFocus={autoFocus}
          style={{
            width:'100%', background: focused?'#120D09':'#0F0B09',
            border:'none',
            borderBottom:`2px solid ${focused?'#8B1A1A':'rgba(232,223,200,.18)'}`,
            borderRadius:'4px 8px 0 0',
            color:'#E8DFC8', fontFamily:"'Courier Prime',monospace",
            fontSize:15, padding:'12px 14px',
            outline:'none', transition:'all .2s',
          }}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
        />
        {/* rubber hose corner accent */}
        {focused && (
          <div style={{
            position:'absolute', bottom:-2, right:0,
            width:8, height:8,
            background:'#8B1A1A',
            borderRadius:'50% 50% 0 50%',
          }}/>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SUBMIT BUTTON
══════════════════════════════════════════════════════ */
function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading} style={{
      width:'100%', marginTop:8,
      fontFamily:"'Boogaloo',cursive",
      fontSize:18, letterSpacing:'.14em', textTransform:'uppercase',
      background: loading?'#5C0E0E':'#8B1A1A',
      color:'#E8DFC8',
      border:'3px solid #E8DFC8',
      borderRadius:'10px 16px 10px 16px / 16px 10px 16px 10px',
      padding:'15px 32px',
      boxShadow: loading?'2px 2px 0 #E8DFC8':'5px 6px 0 #E8DFC8',
      cursor: loading?'not-allowed':'pointer',
      transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
      opacity: loading?.65:1,
      position:'relative', overflow:'hidden',
    }}
      onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform='scale(1.03) rotate(-.5deg)';e.currentTarget.style.background='#6B0F0F';e.currentTarget.style.boxShadow='7px 8px 0 #E8DFC8'}}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.background=loading?'#5C0E0E':'#8B1A1A';e.currentTarget.style.boxShadow=loading?'2px 2px 0 #E8DFC8':'5px 6px 0 #E8DFC8'}}
      onMouseDown={e=>{e.currentTarget.style.transform='scale(.95)';e.currentTarget.style.boxShadow='1px 2px 0 #E8DFC8'}}
      onMouseUp={e=>{e.currentTarget.style.transform='scale(1.02) rotate(-.5deg)'}}
    >
      {children}
    </button>
  )
}

/* ══════════════════════════════════════════════════════
   SHARED AUTH LAYOUT
══════════════════════════════════════════════════════ */
function AuthLayout({ title, subtitle, onSubmit, children, switchText, switchLink, switchLabel, error }) {
  return (
    <div style={{
      minHeight:'100vh', background:'#070504',
      display:'flex', overflow:'hidden', position:'relative',
      animation:'authPageIn .55s cubic-bezier(.16,1,.3,1) both',
    }}>
      <style>{`
        @keyframes authPoleScroll { from{transform:translate3d(0,0,0);}to { transform: translate3d(0,-25%,0); } }
        @keyframes authPageIn { from{opacity:0;transform:translate3d(0,12px,0);}to{opacity:1;transform:translate3d(0,0,0);} }
        @keyframes authFloat { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-12px) rotate(3deg);} }
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authWobble { 0%,100%{transform:rotate(-1.5deg);} 50%{transform:rotate(1.5deg);} }
        @keyframes authSlideIn { from{opacity:0;transform:translateX(-40px);} to{opacity:1;transform:none;} }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(20px) scale(.97);} to{opacity:1;transform:none;} }
        @keyframes authBgGrid {
          0%{transform:translate(0,0);}
          50%{transform:translate(4px,4px);}
          100%{transform:translate(0,0);}
        }
        @keyframes authStar { 0%,100%{transform:scale(1) rotate(0deg);}  50%{transform:scale(1.3) rotate(180deg);} }
      `}</style>

      {/* ── LEFT PANEL — rubber hose artwork ── */}
      <div style={{
        width: 420, flexShrink:0,
        background:'#0A0706',
        borderRight:'2px solid rgba(232,223,200,.1)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'48px 40px', gap:32, position:'relative',
        overflow:'hidden',
      }} className="auth-left-panel">
        {/* hide on small screens */}
        <style>{`@media(max-width:860px){.auth-left-panel{display:none!important}}`}</style>

        {/* bg grid */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(139,26,26,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,26,26,.05) 1px,transparent 1px)',
          backgroundSize:'40px 40px',
          animation:'authBgGrid 8s ease-in-out infinite',
        }}/>

        {/* ink splat */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}>
          <InkSplat size={400} opacity={0.06}/>
        </div>

        {/* wordmark */}
        <div style={{ textAlign:'center', position:'relative', animation:'authSlideIn .7s ease both' }}>
          <Scissors size={64} delay={0}/>
          <div style={{
            fontFamily:"'Bebas Neue',sans-serif", fontSize:22,
            letterSpacing:'.22em', textTransform:'uppercase',
            color:'rgba(232,223,200,.5)', marginTop:16,
          }}>
            Barbershopnearme
          </div>
          <div style={{
            fontFamily:"'Courier Prime',monospace", fontSize:10,
            letterSpacing:'.3em', textTransform:'uppercase',
            color:'rgba(232,223,200,.25)', marginTop:4,
          }}>
            Est. 1931 · Hattiesburg, MS
          </div>
        </div>

        {/* big decorative text */}
        <div style={{
          fontFamily:"'Bebas Neue',sans-serif",
          fontSize:'clamp(52px,8vw,80px)', lineHeight:.88,
          letterSpacing:'.02em', textTransform:'uppercase',
          color:'#E8DFC8', textAlign:'center',
          textShadow:'4px 4px 0 #8B1A1A',
          animation:'authWobble 4s ease-in-out infinite',
          position:'relative',
        }}>
          The Chair<br/>
          <span style={{ color:'#8B1A1A' }}>Awaits</span><br/>
          You.
        </div>

        {/* decorations */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, position:'relative' }}>
          <BarberPole height={160}/>
          <Razor/>
          <StarCluster/>
        </div>

        {/* taglines */}
        <div style={{
          fontFamily:"'Courier Prime',monospace",
          fontSize:11, letterSpacing:'.22em', textTransform:'uppercase',
          color:'rgba(232,223,200,.28)', textAlign:'center', lineHeight:2.4,
          position:'relative',
        }}>
          Cold blade · Hot towel<br/>No excuses · No mercy
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px 24px', position:'relative', overflow:'hidden', minWidth:0,
      }}>
        {/* bg halftone */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle,rgba(232,223,200,.025) 1px,transparent 1px)',
          backgroundSize:'20px 20px',
        }}/>

        {/* diagonal slash accent */}
        <div style={{
          position:'absolute', top:'-20%', right:'-10%',
          width:'50%', height:'140%',
          background:'repeating-linear-gradient(170deg,transparent,transparent 50px,rgba(139,26,26,.04) 50px,rgba(139,26,26,.04) 51px)',
          pointerEvents:'none',
        }}/>

        <div style={{
          width:'100%', maxWidth:420, position:'relative',
          animation:'authFadeUp .65s cubic-bezier(.16,1,.3,1) both',
        }}>
          {/* mobile logo */}
          <div style={{ display:'none', textAlign:'center', marginBottom:32 }} className="auth-mobile-logo">
            <style>{`.auth-mobile-logo{display:none!important}@media(max-width:860px){.auth-mobile-logo{display:block!important}}`}</style>
            <Scissors size={48} delay={0}/>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(232,223,200,.5)', marginTop:12 }}>
              Barbershopnearme
            </div>
          </div>

          {/* form card */}
          <div style={{
            background:'#0F0B09',
            border:'1px solid rgba(232,223,200,.08)',
            borderTop:'3px solid #8B1A1A',
            borderRadius:'2px 14px 10px 10px',
            padding:'40px 36px',
            boxShadow:'0 24px 64px rgba(0,0,0,.6), 6px 6px 0 rgba(139,26,26,.2)',
            position:'relative', overflow:'hidden',
          }}>
            {/* corner ink dot */}
            <div style={{
              position:'absolute', top:-1, right:20,
              width:12, height:12, background:'#8B1A1A',
              borderRadius:'50% 50% 50% 0',
            }}/>

            {/* title */}
            <div style={{ marginBottom:32 }}>
              <h1 style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:38, letterSpacing:'.06em', textTransform:'uppercase',
                color:'#E8DFC8', lineHeight:1, marginBottom:8,
                textShadow:'2px 2px 0 rgba(139,26,26,.5)',
              }}>
                {title}
              </h1>
              <p style={{
                fontFamily:"'Courier Prime',monospace",
                fontSize:11, letterSpacing:'.22em', textTransform:'uppercase',
                color:'rgba(232,223,200,.35)',
              }}>
                {subtitle}
              </p>
              {/* underline rule */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14 }}>
                <div style={{ flex:1, height:1, background:'rgba(232,223,200,.1)' }}/>
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polygon points="5,0 6.5,3.5 10,3.5 7,5.7 8,9 5,7 2,9 3,5.7 0,3.5 3.5,3.5" fill="#8B1A1A"/>
                </svg>
                <div style={{ flex:1, height:1, background:'rgba(232,223,200,.1)' }}/>
              </div>
            </div>

            {/* error */}
            {error && (
              <div style={{
                background:'rgba(139,26,26,.15)', border:'1px solid rgba(139,26,26,.4)',
                borderLeft:'3px solid #8B1A1A',
                borderRadius:'0 6px 6px 0', padding:'10px 14px', marginBottom:20,
                fontFamily:"'Courier Prime',monospace", fontSize:12,
                color:'#ff8888', letterSpacing:'.05em',
                animation:'authFadeUp .3s ease both',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* form */}
            <form onSubmit={onSubmit}>{children}</form>

            {/* switch link */}
            <div style={{
              marginTop:28, paddingTop:22,
              borderTop:'1px solid rgba(232,223,200,.07)',
              textAlign:'center',
              fontFamily:"'Courier Prime',monospace",
              fontSize:12, letterSpacing:'.12em',
              color:'rgba(232,223,200,.3)',
            }}>
              {switchText}{' '}
              <Link to={switchLink} style={{
                color:'#8B1A1A', textDecoration:'none', fontWeight:700,
                transition:'color .2s',
              }}
                onMouseEnter={e=>e.target.style.color='#C43030'}
                onMouseLeave={e=>e.target.style.color='#8B1A1A'}
              >{switchLabel}</Link>
            </div>
          </div>

          {/* back link */}
          <div style={{ textAlign:'center', marginTop:20 }}>
            <Link to="/" style={{
              fontFamily:"'Courier Prime',monospace",
              fontSize:10, letterSpacing:'.25em', textTransform:'uppercase',
              color:'rgba(232,223,200,.2)', textDecoration:'none',
              transition:'color .2s',
            }}
              onMouseEnter={e=>e.target.style.color='rgba(232,223,200,.45)'}
              onMouseLeave={e=>e.target.style.color='rgba(232,223,200,.2)'}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════ */
export function LoginPage() {
  const { login, loading, clearError } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [showTransition, setShowTransition] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); clearError()
    try {
      await login(email, password)
      setShowTransition(true)  /* show portal transition then navigate */
    } catch (err) {
      setError(err.message)
    }
  }

  if (showTransition)
    return <PortalTransition onDone={() => navigate('/portal')}/>

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your client portal"
      onSubmit={handleSubmit}
      switchText="Don't have an account?"
      switchLink="/signup"
      switchLabel="Sign Up"
      error={error}
    >
      <Field label="Email" type="email" value={email}
        onChange={e=>setEmail(e.target.value)}
        placeholder="you@example.com" autoFocus/>
      <Field label="Password" type="password" value={password}
        onChange={e=>setPassword(e.target.value)}
        placeholder="••••••••"/>
      <SubmitBtn loading={loading}>✂ Sign In</SubmitBtn>
    </AuthLayout>
  )
}

/* ══════════════════════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════════════════════ */
export function SignupPage() {
  const { signup, loading, clearError } = useAuth()
  const navigate = useNavigate()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [showTransition, setShowTransition] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); clearError()
    if (password !== confirm) { setError("Passwords don't match."); return }
    try {
      await signup(name, email, password)
      setShowTransition(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (showTransition)
    return <PortalTransition onDone={() => navigate('/portal')}/>

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Book your first appointment today"
      onSubmit={handleSubmit}
      switchText="Already have an account?"
      switchLink="/login"
      switchLabel="Sign In"
      error={error}
    >
      <Field label="Full Name" value={name}
        onChange={e=>setName(e.target.value)}
        placeholder="Jack Pepper" autoFocus/>
      <Field label="Email" type="email" value={email}
        onChange={e=>setEmail(e.target.value)}
        placeholder="you@example.com"/>
      <Field label="Password" type="password" value={password}
        onChange={e=>setPassword(e.target.value)}
        placeholder="At least 6 characters"/>
      <Field label="Confirm Password" type="password" value={confirm}
        onChange={e=>setConfirm(e.target.value)}
        placeholder="••••••••"/>
      <SubmitBtn loading={loading}>✂ Create Account</SubmitBtn>
    </AuthLayout>
  )
}
