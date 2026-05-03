import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

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

export default function Navbar({ onBookNow }) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* close menu on route change or scroll */
  useEffect(() => { setMenuOpen(false) }, [])

  const go = (id) => {
    setMenuOpen(false)
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const nav = (path) => { setMenuOpen(false); navigate(path) }

  return (
    <>
      <style>{`
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

        /* mobile drawer */
        .navbar-drawer{
          display:none;position:fixed;top:54px;left:0;right:0;z-index:199;
          background:var(--color-ink);border-bottom:3px solid var(--color-bone);
          padding:20px 16px 28px;flex-direction:column;gap:4px;
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
          padding:14px 8px;text-align:left;
          border-bottom:1px solid rgba(232,223,200,.07);
          transition:color .2s;width:100%;
        }
        .drawer-item:hover{color:var(--color-bone);}
        .drawer-item:last-child{border-bottom:none;}
        .drawer-cta{
          margin-top:12px;font-family:var(--font-rubber);font-size:16px;
          letter-spacing:.12em;text-transform:uppercase;
          background:var(--color-blood);color:var(--color-bone);
          border:3px solid var(--color-bone);border-radius:50px;
          padding:13px 24px;cursor:pointer;width:100%;text-align:center;
          box-shadow:4px 4px 0 var(--color-bone);transition:transform .2s;
        }
        .drawer-cta:active{transform:scale(.96);}

        @media(max-width:640px){
          .navbar-hamburger{display:flex;}
          .navbar-links{display:none!important;}
        }
      `}</style>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <span className="navbar-wordmark" onClick={() => { setMenuOpen(false); window.scrollTo({ top:0, behavior:'smooth' }) }}>
            Barbershopnearme
          </span>

          {/* Desktop nav */}
          <ul className="navbar-links">
            <li className="navbar-link-hide">
              <button className="navbar-link" onClick={() => go('services')}>Services</button>
            </li>
            <li className="navbar-link-hide">
              <button className="navbar-link" onClick={() => go('barbers')}>Barbers</button>
            </li>
            <li className="navbar-link-hide">
              <button className="navbar-link" onClick={() => nav('/newsletter')}>News</button>
            </li>
            {user ? (
              <>
                <li>
                  <button className="navbar-link" onClick={() => nav('/dashboard')}
                    style={{ color:'var(--color-bone)' }}>
                    My Bookings
                  </button>
                </li>
                <li>
                  <button className="btn-ink-sm" onClick={() => { logout(); navigate('/') }}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button className="btn-ink-sm" onClick={onBookNow}>
                  <ScissorsIcon/> Book Now
                </button>
              </li>
            )}
          </ul>

          {/* Mobile hamburger */}
          <button
            className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer${menuOpen ? ' open' : ''}`}>
        <button className="drawer-item" onClick={() => go('services')}>✂ Services</button>
        <button className="drawer-item" onClick={() => go('barbers')}>👤 Barbers</button>
        <button className="drawer-item" onClick={() => nav('/newsletter')}>📣 News</button>
        {user ? (
          <>
            <button className="drawer-item" onClick={() => nav('/dashboard')}>📅 My Bookings</button>
            <button className="drawer-item" style={{color:'#f87171'}} onClick={() => { logout(); navigate('/'); setMenuOpen(false) }}>⏻ Sign Out</button>
          </>
        ) : (
          <>
            <button className="drawer-item" onClick={() => { nav('/login') }}>Sign In</button>
            <button className="drawer-cta" onClick={() => { setMenuOpen(false); onBookNow?.() }}>
              <ScissorsIcon/> Book Now
            </button>
          </>
        )}
      </div>
    </>
  )
}
