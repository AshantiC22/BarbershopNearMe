import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

/* rubber hose scissors SVG inline */
function ScissorsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }}
    >
      <circle cx="6" cy="6" r="3" stroke="#E8DFC8" strokeWidth="2" />
      <circle cx="6" cy="18" r="3" stroke="#E8DFC8" strokeWidth="2" />
      <line x1="9" y1="9" x2="22" y2="22" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="15" x2="22" y2="2" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <span
          className="navbar-wordmark"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Barbershopnearme
        </span>
        <ul className="navbar-links">
          <li className="navbar-link-hide">
            <button className="navbar-link" onClick={() => go('services')}>
              Services
            </button>
          </li>
          <li className="navbar-link-hide">
            <button className="navbar-link" onClick={() => go('barbers')}>
              Barbers
            </button>
          </li>
          <li className="navbar-link-hide">
            <button className="navbar-link" onClick={() => navigate('/newsletter')}>
              News
            </button>
          </li>
          {user ? (
            <>
              <li>
                <button
                  className="navbar-link"
                  onClick={() => navigate('/dashboard')}
                  style={{ color: 'var(--color-bone)' }}
                >
                  My Bookings
                </button>
              </li>
              <li>
                <button
                  className="btn-ink-sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn-ink-sm" onClick={onBookNow}>
                <ScissorsIcon /> Book Now
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
