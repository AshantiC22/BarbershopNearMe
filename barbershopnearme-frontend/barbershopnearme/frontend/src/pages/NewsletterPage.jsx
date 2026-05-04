import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api.js'

const T = {
  ink:'#070504', ink2:'#0F0B09', bone:'#E8DFC8',
  blood:'#8B1A1A', blood2:'#6B0F0F',
  dim1:'rgba(232,223,200,.55)', dim2:'rgba(232,223,200,.14)', dim3:'rgba(232,223,200,.14)',
}

const CATS = {
  deal:    { color:'#4ade80', bg:'rgba(74,222,128,.08)',   border:'rgba(74,222,128,.25)',   label:'Deal'    },
  promo:   { color:T.blood,   bg:'rgba(139,26,26,.1)',     border:'rgba(139,26,26,.3)',     label:'Promo'   },
  update:  { color:'#a78bfa', bg:'rgba(167,139,250,.08)', border:'rgba(167,139,250,.25)', label:'Update'  },
  event:   { color:'#38bdf8', bg:'rgba(56,189,248,.08)',  border:'rgba(56,189,248,.25)',  label:'Event'   },
  general: { color:T.dim1,    bg:T.dim3,                   border:T.dim2,                   label:'General' },
}

const FILTERS = ['all','deal','promo','update','event','general']
const radii   = ['14px 8px 12px 10px/10px 12px 8px 14px','8px 14px 10px 12px/12px 8px 14px 10px','12px 10px 14px 8px/8px 14px 10px 12px','10px 12px 8px 14px/14px 10px 12px 8px']

function fmtDate(d){ return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) }

export default function NewsletterPage(){
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(()=>{
    // Mark all posts as seen when page loads
    api.post('newsletter/mark-seen/', {}).catch(()=>{})
    api.get('newsletter/')
      .then(d => setPosts(Array.isArray(d)?d:d.results||[]))
      .catch(()=>setPosts([]))
      .finally(()=>setLoading(false))
  },[])

  const shown = filter==='all' ? posts : posts.filter(p=>p.category===filter)

  return (
    <div style={{ minHeight:'100vh', background:T.ink, animation:'pageEntry .55s cubic-bezier(.16,1,.3,1) both' }}>
      <style>{`@keyframes pageEntry{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} @keyframes floatBob{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(3deg)}}`}</style>

      {/* navbar */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:T.ink,borderBottom:`3px solid ${T.bone}`,height:62,display:'flex',alignItems:'center' }}>
        <div style={{ width:'100%',maxWidth:1120,margin:'0 auto',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <Link to="/" style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:'.22em',textTransform:'uppercase',color:T.bone,textDecoration:'none' }}>Barbershopnearme</Link>
          <Link to="/dashboard" style={{ fontFamily:"'Boogaloo',cursive",fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',color:T.dim1,textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </nav>

      <div style={{ maxWidth:1120, margin:'0 auto', padding:'48px 32px' }}>

        {/* header */}
        <div style={{ marginBottom:48 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:T.blood,letterSpacing:'.2em' }}>SHOP NEWS</span>
            <div style={{ width:36,height:2,background:T.bone,opacity:.25,borderRadius:2 }}/>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(40px,7vw,64px)',lineHeight:.9,letterSpacing:'.04em',textTransform:'uppercase',color:T.bone,textShadow:`3px 3px 0 ${T.blood}` }}>
            Deals &<br/><span style={{ color:T.blood }}>Updates</span>
          </h1>
        </div>

        {/* filter pills */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:40 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{
              fontFamily:"'Boogaloo',cursive",fontSize:13,letterSpacing:'.1em',textTransform:'uppercase',
              background: filter===f ? T.blood : 'transparent',
              color: filter===f ? T.bone : T.dim1,
              border:`2px solid ${filter===f ? T.bone : T.dim2}`,
              borderRadius:'50px 46px 50px 44px/44px 50px 46px 50px',
              padding:'6px 18px',cursor:'pointer',
              boxShadow: filter===f ? `3px 3px 0 ${T.bone}` : 'none',
              transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
            }}>
              {f==='all'?'All':CATS[f]?.label||f}
            </button>
          ))}
        </div>

        {/* posts grid */}
        {loading ? (
          <div style={{ textAlign:'center',padding:'80px 0',fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:T.dim1,letterSpacing:'.1em' }}>Loading...</div>
        ) : shown.length===0 ? (
          <div style={{ textAlign:'center',padding:'80px 0',fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:T.dim1,letterSpacing:'.08em' }}>No posts yet.</div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:24 }}>
            {shown.map((post,i) => {
              const cat = CATS[post.category] || CATS.general
              const pinned = post.pinned
              return (
                <div key={post.id} style={{
                  background: T.ink2,
                  border:`3px solid ${pinned?T.blood:T.dim2}`,
                  borderTop:`4px solid ${cat.color}`,
                  borderRadius:radii[i%4],
                  padding:'28px 24px',
                  boxShadow: pinned ? `5px 5px 0 rgba(139,26,26,.3)` : `5px 5px 0 rgba(232,223,200,.14)`,
                  position:'relative',overflow:'hidden',
                  transition:'transform .3s cubic-bezier(.34,1.56,.64,1)',
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-6px) rotate(-.4deg)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}
                >
                  {pinned && (
                    <div style={{ position:'absolute',top:12,right:12,fontFamily:"'Boogaloo',cursive",fontSize:13,letterSpacing:'.12em',textTransform:'uppercase',color:T.blood,border:`2px solid rgba(139,26,26,.35)`,borderRadius:50,padding:'2px 10px' }}>
                      📌 Pinned
                    </div>
                  )}
                  {/* category badge */}
                  <span style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,letterSpacing:'.22em',textTransform:'uppercase',color:cat.color,background:cat.bg,border:`2px solid ${cat.border}`,borderRadius:50,padding:'3px 12px',display:'inline-block',marginBottom:14 }}>
                    {cat.label}
                  </span>
                  {/* emoji + title */}
                  <div style={{ display:'flex',gap:12,alignItems:'flex-start',marginBottom:12 }}>
                    <span style={{ fontSize:28,animation:`floatBob ${3+i*.3}s ease-in-out ${i*.2}s infinite`,flexShrink:0 }}>{post.emoji||'✂️'}</span>
                    <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:'.05em',textTransform:'uppercase',color:T.bone,lineHeight:1,margin:0 }}>
                      {post.title}
                    </h2>
                  </div>
                  <p style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,lineHeight:1.8,color:T.dim1,marginBottom:16 }}>
                    {post.body}
                  </p>
                  <div style={{ fontFamily:"'Courier Prime',monospace",fontSize:13,letterSpacing:'.22em',textTransform:'uppercase',color:T.dim1,opacity:.6 }}>
                    {fmtDate(post.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
