import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '@/services/api.js'

const T = { ink:'#070504',ink2:'#0F0B09',bone:'#E8DFC8',blood:'#8B1A1A',blood2:'#6B0F0F',gold:'#C8A840',dim1:'rgba(232,223,200,.55)',dim2:'rgba(232,223,200,.14)',dim3:'rgba(232,223,200,.06)' }

function StarRating({ value, onChange, readonly=false }){
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display:'flex',gap:10,alignItems:'center' }}>
      {[1,2,3,4,5].map(star => {
        const lit = (hovered||value) >= star
        return (
          <button key={star}
            onClick={()=>!readonly&&onChange&&onChange(star)}
            onMouseEnter={()=>!readonly&&setHovered(star)}
            onMouseLeave={()=>!readonly&&setHovered(0)}
            style={{ background:'none',border:'none',cursor:readonly?'default':'pointer',padding:2,transition:'transform .15s',transform:!readonly&&hovered>=star?'scale(1.25) rotate(-5deg)':'scale(1)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={lit?T.gold:'none'} stroke={lit?T.gold:T.dim2} strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default function ReviewPage(){
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const token          = searchParams.get('token')

  const [appt,      setAppt]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [done,      setDone]      = useState(false)
  const [completed, setCompleted] = useState(true)
  const [rating,    setRating]    = useState(5)
  const [comment,   setComment]   = useState('')
  const [submitting,setSubmitting]= useState(false)
  const [error,     setError]     = useState('')

  useEffect(()=>{
    if(!token){ setLoading(false); return }
    api.get(`/review/submit/?token=${token}`)
      .then(d=>setAppt(d))
      .catch(()=>setError('Invalid or expired review link.'))
      .finally(()=>setLoading(false))
  },[token])

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      await api.post('/review/submit/',{ token, completed, rating: completed?rating:1, comment })
      setDone(true)
    } catch(e){ setError(e.message) }
    finally{ setSubmitting(false) }
  }

  if(loading) return (
    <div style={{ minHeight:'100vh',background:T.ink,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:T.dim1,letterSpacing:'.1em' }}>
      Loading...
    </div>
  )

  if(done) return (
    <div style={{ minHeight:'100vh',background:T.ink,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:64,marginBottom:24,animation:'floatBob 3s ease-in-out infinite' }}>✂️</div>
        <style>{`@keyframes floatBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(44px,9vw,72px)',lineHeight:.9,color:T.bone,textShadow:`4px 4px 0 ${T.blood}`,marginBottom:16 }}>
          Thanks for<br/>the Review!
        </h1>
        <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,color:T.dim1,marginBottom:32 }}>
          We appreciate you. See you next time.
        </p>
        <Link to="/" style={{ fontFamily:"'Boogaloo',cursive",fontSize:16,letterSpacing:'.12em',textTransform:'uppercase',background:T.blood,color:T.bone,border:`3px solid ${T.bone}`,borderRadius:50,padding:'12px 32px',textDecoration:'none',boxShadow:`4px 4px 0 ${T.bone}` }}>
          Back to Home
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',background:T.ink,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div style={{ width:'100%',maxWidth:480 }}>
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ fontFamily:"'Boogaloo',cursive",fontSize:13,letterSpacing:'.18em',textTransform:'uppercase',color:T.blood,marginBottom:8 }}>
            ✂ Post-Haircut Review
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:44,lineHeight:.9,color:T.bone,textShadow:`3px 3px 0 ${T.blood}` }}>
            How'd We Do?
          </h1>
        </div>

        {error && (
          <div style={{ background:'rgba(139,26,26,.15)',border:`2px solid rgba(139,26,26,.4)`,borderRadius:8,padding:'12px 16px',marginBottom:24,fontFamily:"'Courier Prime',monospace",fontSize:13,color:'#ff8888',textAlign:'center' }}>
            {error}
          </div>
        )}

        <div style={{ background:T.ink2,border:`3px solid ${T.dim2}`,borderTop:`4px solid ${T.blood}`,borderRadius:'2px 14px 10px 10px',padding:'36px 32px',boxShadow:`6px 6px 0 rgba(139,26,26,.2)` }}>

          {appt && (
            <div style={{ background:T.dim3,border:`1px solid ${T.dim2}`,borderRadius:8,padding:'12px 16px',marginBottom:28 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:T.bone }}>{appt.service_name} with {appt.barber_name}</div>
            </div>
          )}

          {/* did haircut happen? */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,letterSpacing:'.28em',textTransform:'uppercase',color:T.dim1,marginBottom:12 }}>Did you get your haircut?</div>
            <div style={{ display:'flex',gap:10 }}>
              {[['Yes, looking sharp! ✂','yes',true],['No, I was a no-show','no',false]].map(([label,key,val])=>(
                <button key={key} onClick={()=>setCompleted(val)} style={{
                  flex:1,fontFamily:"'Boogaloo',cursive",fontSize:14,letterSpacing:'.1em',textTransform:'uppercase',
                  background:completed===val?T.blood:'transparent',
                  color:completed===val?T.bone:T.dim1,
                  border:`2px solid ${completed===val?T.bone:T.dim2}`,
                  borderRadius:'8px 12px 8px 12px/12px 8px 12px 8px',
                  padding:'10px 8px',cursor:'pointer',
                  boxShadow:completed===val?`3px 3px 0 ${T.bone}`:'none',
                  transition:'all .2s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* star rating — only if completed */}
          {completed && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,letterSpacing:'.28em',textTransform:'uppercase',color:T.dim1,marginBottom:14 }}>Your Rating</div>
              <StarRating value={rating} onChange={setRating}/>
            </div>
          )}

          {/* comment */}
          <div style={{ marginBottom:28 }}>
            <label style={{ fontFamily:"'Courier Prime',monospace",fontSize:10,letterSpacing:'.28em',textTransform:'uppercase',color:T.dim1,display:'block',marginBottom:8 }}>
              Comment (optional)
            </label>
            <textarea value={comment} onChange={e=>setComment(e.target.value)}
              placeholder="How was your experience?"
              rows={4} style={{
                width:'100%',background:'#0C0906',border:'none',
                borderBottom:`2px solid ${T.dim2}`,
                borderRadius:'4px 8px 0 0',color:T.bone,
                fontFamily:"'Courier Prime',monospace",fontSize:14,
                padding:'12px 14px',outline:'none',resize:'vertical',
                transition:'border-color .2s',
              }}
              onFocus={e=>e.target.style.borderBottomColor=T.blood}
              onBlur={e=>e.target.style.borderBottomColor=T.dim2}
            />
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{
            width:'100%',fontFamily:"'Boogaloo',cursive",fontSize:18,letterSpacing:'.14em',textTransform:'uppercase',
            background:submitting?T.blood2:T.blood,color:T.bone,
            border:`3px solid ${T.bone}`,
            borderRadius:'8px 14px 8px 14px/14px 8px 14px 8px',
            padding:'15px 32px',cursor:submitting?'not-allowed':'pointer',
            boxShadow:submitting?`2px 2px 0 ${T.bone}`:`5px 5px 0 ${T.bone}`,
            opacity:submitting?.7:1,transition:'all .2s',
          }}>
            {submitting?'Submitting...':'✂ Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}
