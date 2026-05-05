import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar.jsx'
import Footer from '@/components/layout/Footer.jsx'
import Hero from '@/components/sections/Hero.jsx'
import Ticker from '@/components/sections/Ticker.jsx'
import Services from '@/components/sections/Services.jsx'
import Barbers from '@/components/sections/Barbers.jsx'
import Gallery from '@/components/sections/Gallery.jsx'
import Reviews from '@/components/sections/Reviews.jsx'
import Location from '@/components/sections/Location.jsx'

function PushBanner() {
  const [show, setShow] = useState(false)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  const isIOSSafari = isIOS && !isStandalone

  useEffect(() => {
    if (localStorage.getItem('push_banner_dismissed')) return
    if (isIOSSafari) {
      const t = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(t)
    }
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return
    const t = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const handleAllow = async () => {
    setShow(false)
    localStorage.setItem('push_banner_dismissed', '1')
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
      window.dispatchEvent(new CustomEvent('request-push-subscribe'))
    } catch (e) {}
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('push_banner_dismissed', '1')
  }

  if (!show) return null

  /* ── iOS Safari: step-by-step Add to Home Screen guide ── */
  if (isIOSSafari) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#0F0B09',
          borderTop: '4px solid #8B1A1A',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 40px',
          boxShadow: '0 -8px 40px rgba(0,0,0,.9)',
          animation: 'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* drag handle */}
        <div
          style={{
            width: 36,
            height: 4,
            background: 'rgba(232,223,200,.2)',
            borderRadius: 2,
            margin: '0 auto 16px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>📲</span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 20,
                color: '#E8DFC8',
                margin: '0 0 5px',
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}
            >
              Get Notifications on iPhone
            </p>
            <p
              style={{
                fontFamily: "'Courier Prime',monospace",
                fontSize: 12,
                color: 'rgba(232,223,200,.75)',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Add to your Home Screen to get booking updates even when the app is closed.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(232,223,200,.4)',
              fontSize: 20,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {[
          ['1', '⬆️', 'Tap the Share button in Safari'],
          ['2', '📱', 'Tap "Add to Home Screen"'],
          ['3', '✂️', 'Tap "Add" then open from your Home Screen'],
          ['4', '🔔', 'Tap Allow when prompted for notifications'],
        ].map(([num, icon, text]) => (
          <div
            key={num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(139,26,26,.08)',
              border: '1px solid rgba(139,26,26,.2)',
              borderRadius: '8px 5px 8px 5px',
              padding: '10px 14px',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 13,
                color: '#8B1A1A',
                flexShrink: 0,
                width: 16,
              }}
            >
              {num}
            </span>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <p
              style={{
                fontFamily: "'Courier Prime',monospace",
                fontSize: 12,
                color: 'rgba(232,223,200,.8)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {text}
            </p>
          </div>
        ))}

        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            marginTop: 10,
            fontFamily: "'Courier Prime',monospace",
            fontSize: 11,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            background: 'none',
            color: 'rgba(232,223,200,.4)',
            border: '1px solid rgba(232,223,200,.12)',
            borderRadius: '50px',
            padding: '10px',
            cursor: 'pointer',
          }}
        >
          Maybe Later
        </button>
      </div>
    )
  }

  /* ── Android / Desktop: allow notifications banner ── */
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        width: 'calc(100% - 32px)',
        maxWidth: 440,
        background: '#0F0B09',
        border: '3px solid #8B1A1A',
        borderRadius: '12px 8px 12px 8px / 8px 12px 8px 12px',
        padding: '18px 20px',
        boxShadow: '0 8px 40px rgba(0,0,0,.85)',
        animation: 'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🔔</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 19,
              color: '#E8DFC8',
              margin: '0 0 5px',
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}
          >
            Never Miss Your Cut
          </p>
          <p
            style={{
              fontFamily: "'Courier Prime',monospace",
              fontSize: 12,
              color: 'rgba(232,223,200,.75)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Get booking confirmations, 1-hour reminders and updates — even when the app is closed.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(232,223,200,.35)',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleAllow}
          style={{
            flex: 1,
            fontFamily: "'Boogaloo',cursive",
            fontSize: 15,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            background: '#8B1A1A',
            color: '#E8DFC8',
            border: '3px solid #E8DFC8',
            borderRadius: '50px',
            padding: '11px 16px',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #E8DFC8',
            transition: 'all .2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
          }}
        >
          ✂ Allow Notifications
        </button>
        <button
          onClick={handleDismiss}
          style={{
            fontFamily: "'Courier Prime',monospace",
            fontSize: 11,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            background: 'none',
            color: 'rgba(232,223,200,.35)',
            border: '2px solid rgba(232,223,200,.12)',
            borderRadius: '50px',
            padding: '11px 14px',
            cursor: 'pointer',
          }}
        >
          Not Now
        </button>
      </div>
    </div>
  )
}

export default function Home({ onBookNow }) {
  return (
    <>
      <Navbar onBookNow={onBookNow} />
      <main>
        <Hero onBookNow={onBookNow} />
        <Ticker />
        <Services />
        <Barbers onBookNow={onBookNow} />
        <Gallery />
        <Reviews />
        <Location />
      </main>
      <Footer />
      <PushBanner />
    </>
  )
}
