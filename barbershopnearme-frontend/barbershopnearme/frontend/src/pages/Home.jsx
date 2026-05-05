import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications.js'
import Navbar    from '@/components/layout/Navbar.jsx'
import Footer    from '@/components/layout/Footer.jsx'
import Hero      from '@/components/sections/Hero.jsx'
import Ticker    from '@/components/sections/Ticker.jsx'
import Services  from '@/components/sections/Services.jsx'
import Barbers   from '@/components/sections/Barbers.jsx'
import Gallery   from '@/components/sections/Gallery.jsx'
import Reviews   from '@/components/sections/Reviews.jsx'
import Location  from '@/components/sections/Location.jsx'

function PushBanner() {
  const { subscribe } = usePushNotifications()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Show banner if notifications not yet granted and not dismissed
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return
    const wasDismissed = localStorage.getItem('push_banner_dismissed')
    if (wasDismissed) return
    // Show after 3 seconds
    const t = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const handleAllow = async () => {
    setShow(false)
    localStorage.setItem('push_banner_dismissed', '1')
    try {
      // This must happen from user gesture — button tap qualifies on iPhone
      await subscribe()
    } catch(e) {}
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('push_banner_dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      zIndex:999, width:'calc(100% - 32px)', maxWidth:420,
      background:'#0F0B09',
      border:'3px solid #8B1A1A',
      borderRadius:'12px 8px 12px 8px / 8px 12px 8px 12px',
      padding:'16px 18px',
      boxShadow:'0 8px 32px rgba(0,0,0,.8), 0 0 0 1px rgba(139,26,26,.3)',
      animation:'rhFadeUp .4s cubic-bezier(.16,1,.3,1) both',
      display:'flex', flexDirection:'column', gap:12,
    }}>
      <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
        <span style={{fontSize:24, flexShrink:0}}>🔔</span>
        <div style={{flex:1}}>
          <p style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:18,
            color:'#E8DFC8', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'.05em'}}>
            Stay in the Loop
          </p>
          <p style={{fontFamily:"'Courier Prime',monospace", fontSize:12,
            color:'rgba(232,223,200,.7)', margin:0, lineHeight:1.6}}>
            Allow notifications to get booking confirmations, reminders, and updates from your barber.
          </p>
        </div>
        <button onClick={handleDismiss} style={{
          background:'none', border:'none', color:'rgba(232,223,200,.4)',
          fontSize:18, cursor:'pointer', padding:0, flexShrink:0, lineHeight:1,
        }}>×</button>
      </div>
      <div style={{display:'flex', gap:10}}>
        <button onClick={handleAllow} style={{
          flex:1, fontFamily:"'Boogaloo',cursive", fontSize:15,
          letterSpacing:'.1em', textTransform:'uppercase',
          background:'#8B1A1A', color:'#E8DFC8',
          border:'3px solid #E8DFC8', borderRadius:'50px',
          padding:'10px 16px', cursor:'pointer',
          boxShadow:'4px 4px 0 #E8DFC8', transition:'all .2s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.03)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none'}}
        >
          ✂ Allow Notifications
        </button>
        <button onClick={handleDismiss} style={{
          fontFamily:"'Courier Prime',monospace", fontSize:11,
          letterSpacing:'.15em', textTransform:'uppercase',
          background:'none', color:'rgba(232,223,200,.4)',
          border:'2px solid rgba(232,223,200,.15)', borderRadius:'50px',
          padding:'10px 14px', cursor:'pointer',
        }}>
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
        <Hero     onBookNow={onBookNow} />
        <Ticker />
        <Services />
        <Barbers  onBookNow={onBookNow} />
        <Gallery />
        <Reviews />
        <Location />
      </main>
      <Footer />
      <PushBanner />
    </>
  )
}
