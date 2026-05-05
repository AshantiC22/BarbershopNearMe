import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import api from '@/services/api.js'

function ScissorsIcon(){
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{display:'inline',verticalAlign:'middle',marginRight:5}}>
      <circle cx="6" cy="6" r="3" stroke="#E8DFC8" strokeWidth="2"/>
      <circle cx="6" cy="18" r="3" stroke="#E8DFC8" strokeWidth="2"/>
      <line x1="9" y1="9" x2="22" y2="22" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="15" x2="22" y2="2" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

/* Notification dot badge */
function Badge({ count }){
  if(!count || count <= 0) return null
  return (
    <span style={{
      position:'absolute', top:-7, right:-10,
      minWidth:16, height:16, borderRadius:8,
      background:'#8B1A1A', color:'#E8DFC8',
      fontFamily:"'Courier Prime',monospace",
      fontSize:8, fontWeight:900, lineHeight:'16px',
      textAlign:'center', padding:'0 4px',
      border:'2px solid #070504',
      boxShadow:'0 0 6px rgba(139,26,26,.9)',
      animation:'badgePulse 2s ease-in-out infinite',
      pointerEvents:'none', zIndex:10,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navbar({ onBookNow }) {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [newsUnread,  setNewsUnread]  = useState(0)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuth()

  /* scroll effect */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* fetch unread newsletter count when user is logged in */
  const fetchUnread = useCallback(async () => {
    if(!user) { setNewsUnread(0); return }
    try {
      const r = await api.get('newsletter/unread/')
      setNewsUnread(r.unread || 0)
    } catch { setNewsUnread(0) }
  }, [user])

  useEffect(() => { fetchUnread() }, [fetchUnread])

  /* clear badge when user visits /newsletter */
  useEffect(() => {
    if(location.pathname === '/newsletter') {
      setNewsUnread(0)
      if(user) {
        api.post('newsletter/mark-seen/', {}).catch(() => {})
      }
    }
  }, [location.pathname, user])

  /* close menu on navigation */
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const go = (id) => {
    setMenuOpen(false)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }), 50)
  }
  const nav = (path) => { setMenuOpen(false); navigate(path) }

  return (
    <>
      <style>{`
        @keyframes badgePulse{
          0%,100%{box-shadow:0 0 4px rgba(139,26,26,.7),0 0 0 0 rgba(139,26,26,.4);}
          50%{box-shadow:0 0 8px rgba(139,26,26,1),0 0 0 5px rgba(139,26,26,0);}
        }
        .navbar-hamburger{
          display:none;flex-direction:column;justify-content:center;align-items:center;
          gap:5px;width:38px;height:38px;background:transparent;
          border:2px solid rgba(232,223,200,.3);border-radius:8px 6px 8px 6px / 6px 8px 6px 8px;
          cursor:pointer;padding:0;transition:border-color .2s;flex-shrink:0;
        }
        .navbar-hamburger:hover{border-color:rgba(232,223,200,.7);}
        .navbar-hamburger span{
          display:block;width:18px;height:2px;background:var(--color-bone);
          border-radius:2px;transition:all .25s cubic-bezier(.34,1.56,.64,1);transform-origin:center;
        }
        .navbar-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .navbar-hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
        .navbar-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

        .navbar-drawer{
          display:none;position:fixed;top:54px;left:0;right:0;z-index:199;
          background:var(--color-ink);border-bottom:3px solid var(--color-bone);
          padding:16px 16px 24px;flex-direction:column;gap:2px;
          box-shadow:0 8px 32px rgba(0,0,0,.8);
          animation:drawerSlide .25s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes drawerSlide{
          from{opacity:0;transform:translateY(-12px);}
          to{opacity:1;transform:none;}
        }
        .navbar-drawer.open{display:flex;}
        .drawer-item{
          font-family:var(--font-body);font-size:13px;letter-spacing:.22em;
          text-transform:uppercase;color:var(--color-dim-1);
          background:none;border:none;cursor:pointer;
          padding:13px 8px;text-align:left;
          border-bottom:1px solid rgba(232,223,200,.07);
          transition:color .2s;width:100%;
          display:flex;align-items:center;gap:10;position:relative;
        }
        .drawer-item:hover{color:var(--color-bone);}
        .drawer-item:last-child{border-bottom:none;}
        .drawer-cta{
          margin-top:10px;font-family:var(--font-rubber);font-size:16px;
          letter-spacing:.12em;text-transform:uppercase;
          background:var(--color-blood);color:var(--color-bone);
          border:3px solid var(--color-bone);border-radius:50px;
          padding:13px 24px;cursor:pointer;width:100%;text-align:center;
          box-shadow:4px 4px 0 var(--color-bone);transition:all .2s;
        }
        .drawer-cta:active{transform:scale(.96);}
        .news-badge-drawer{
          display:inline-flex;align-items:center;justify-content:center;
          minWidth:18px;height:18px;borderRadius:9px;
          background:#8B1A1A;color:#E8DFC8;
          fontFamily:'Courier Prime',monospace;fontSize:9px;fontWeight:900;
          padding:0 5px;border:1.5px solid #070504;
          boxShadow:0 0 6px rgba(139,26,26,.8);
          marginLeft:8px;animation:badgePulse 2s ease-in-out infinite;
        }
        @media(min-width:641px){
          .navbar-hamburger-wrap{display:none!important;}
        }
        @media(max-width:640px){
          .navbar-hamburger{display:flex;}
          .navbar-links{display:none!important;}
        }
      `}</style>

      <nav className={`navbar${scrolled?' scrolled':''}`}>
        <div className="container">
          <span className="navbar-wordmark"
            onClick={()=>{ setMenuOpen(false); window.scrollTo({top:0,behavior:'smooth'}) }}>
            Barbershopnearme
          </span>

          {/* ── DESKTOP NAV ── */}
          <ul className="navbar-links">
            <li className="navbar-link-hide">
              <button className="navbar-link" onClick={()=>go('services')}>Services</button>
            </li>
            <li className="navbar-link-hide">
              <button className="navbar-link" onClick={()=>go('barbers')}>Barbers</button>
            </li>
            <li className="navbar-link-hide" style={{position:'relative'}}>
              <button className="navbar-link" onClick={()=>nav('/newsletter')}>
                News
                <Badge count={newsUnread}/>
              </button>
            </li>
            {user ? (
              <>
                <li>
                  <button className="navbar-link"
                    onClick={()=>nav(user?.is_staff ? '/barber-dashboard' : '/dashboard')}
                    style={{color:'var(--color-bone)'}}>
                    {user?.is_staff ? 'My Dashboard' : 'My Bookings'}
                  </button>
                </li>
                <li>
                  <button className="btn-ink-sm" onClick={()=>{logout();navigate('/')}}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="navbar-link-hide">
                  <button className="navbar-link"
                    onClick={()=>nav('/barber-login')}
                    style={{color:'var(--color-blood)'}}>
                    Barber Login
                  </button>
                </li>
                <li>
                  <button className="btn-ink-sm" onClick={onBookNow}>
                    <ScissorsIcon/> Book Now
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* ── MOBILE HAMBURGER — hidden on desktop via CSS ── */}
          <div className="navbar-hamburger-wrap" style={{position:'relative'}}>
            <button
              className={`navbar-hamburger${menuOpen?' open':''}`}
              onClick={()=>setMenuOpen(o=>!o)}
              aria-label="Menu"
            >
              <span/><span/><span/>
            </button>
            {/* Red dot on hamburger when there are unread news posts */}
            {newsUnread > 0 && (
              <span style={{
                position:'absolute', top:-4, right:-4,
                minWidth:18, height:18, borderRadius:9,
                background:'#8B1A1A', color:'#E8DFC8',
                fontFamily:"'Courier Prime',monospace",
                fontSize:9, fontWeight:900,
                display:'flex', alignItems:'center', justifyContent:'center',
                padding:'0 4px',
                border:'2px solid #070504',
                boxShadow:'0 0 8px rgba(139,26,26,.9)',
                animation:'badgePulse 2s ease-in-out infinite',
                pointerEvents:'none', zIndex:10,
              }}>
                {newsUnread > 99 ? '99+' : newsUnread}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`navbar-drawer${menuOpen?' open':''}`}>
        <button className="drawer-item" onClick={()=>go('services')}>✂ Services</button>
        <button className="drawer-item" onClick={()=>go('barbers')}>👤 Barbers</button>
        <button className="drawer-item" onClick={()=>nav('/newsletter')}
          style={{color: newsUnread>0 ? '#E8DFC8' : undefined}}>
          📣 News
          {newsUnread > 0 && (
            <span style={{
              display:'inline-flex',alignItems:'center',justifyContent:'center',
              minWidth:18,height:18,borderRadius:9,
              background:'#8B1A1A',color:'#E8DFC8',
              fontFamily:"'Courier Prime',monospace",fontSize:9,fontWeight:900,
              padding:'0 5px',border:'1.5px solid #070504',
              boxShadow:'0 0 6px rgba(139,26,26,.8)',
              marginLeft:8,
            }}>
              {newsUnread > 99 ? '99+' : newsUnread}
            </span>
          )}
        </button>
        {user ? (
          <>
            <button className="drawer-item"
              onClick={()=>nav(user?.is_staff ? '/barber-dashboard' : '/dashboard')}>
              {user?.is_staff ? '🪑 My Dashboard' : '📅 My Bookings'}
            </button>
            <button className="drawer-item"
              style={{color:'rgba(248,113,113,.7)'}}
              onClick={()=>{logout();navigate('/');setMenuOpen(false)}}>
              ⏻ Sign Out
            </button>
          </>
        ) : (
          <>
            <button className="drawer-item" onClick={()=>nav('/login')}>Sign In</button>
            <button className="drawer-item" onClick={()=>nav('/barber-login')}
              style={{color:'rgba(139,26,26,.9)',borderBottom:'1px solid rgba(139,26,26,.2)'}}>
              ✂ Barber Login
            </button>
            <button className="drawer-cta" onClick={()=>{setMenuOpen(false);onBookNow?.()}}>
              <ScissorsIcon/> Book Now
            </button>
          </>
        )}
      </div>
    </>
  )
}
