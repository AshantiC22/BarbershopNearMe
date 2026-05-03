import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import BookNowTransition from '@/components/ui/BookNowTransition.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  /* Play transition then navigate */
  if (showTransition)
    return <BookNowTransition onDone={() => navigate('/login')} />

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <span className="navbar-wordmark" onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>
          Barbershopnearme
        </span>
        <ul className="navbar-links">
          <li className="navbar-link-hide">
            <button className="navbar-link" onClick={() => go('services')}>Services</button>
          </li>
          <li className="navbar-link-hide">
            <button className="navbar-link" onClick={() => go('barbers')}>Barbers</button>
          </li>
          {user ? (
            <>
              <li>
                <button className="navbar-link" onClick={() => navigate('/portal')}
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
              {/* Book Now → PortalTransition → /login */}
              <button className="btn-ink-sm" onClick={() => setShowTransition(true)}>
                Book Now
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}
