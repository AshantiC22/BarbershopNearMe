import { useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import { usePushNotifications } from '@/hooks/usePushNotifications.js'
import api from '@/services/api.js'

const T = {
  ink:'#070504', ink2:'#0F0B09',
  bone:'#E8DFC8', blood:'#8B1A1A',
  green:'#4ade80', greenDim:'rgba(74,222,128,.1)', greenBorder:'rgba(74,222,128,.25)',
  red:'#f87171', redDim:'rgba(248,113,113,.08)', redBorder:'rgba(248,113,113,.25)',
  dim:'rgba(232,223,200,.4)',
}
const sf   = { fontFamily:"'Bebas Neue',sans-serif" }
const mono = { fontFamily:"'Courier Prime',monospace" }
const PILL = '50px 46px 50px 44px / 44px 50px 46px 50px'

export default function PushTestPage(){
  const { user } = useAuth()
  const { subscribe } = usePushNotifications()
  const [log,      setLog]      = useState([])
  const [loading,  setLoading]  = useState(false)
  const [subStatus, setSubStatus] = useState('unknown')

  const addLog = (msg, type='info') => {
    const time = new Date().toLocaleTimeString()
    setLog(prev => [...prev, { msg, type, time }])
  }

  const checkSubscription = async () => {
    if(!('serviceWorker' in navigator)){ addLog('❌ Service Worker not supported', 'error'); return }
    if(!('PushManager' in window)){ addLog('❌ Push API not supported', 'error'); return }
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if(sub){
        addLog('✓ Push subscription found in browser', 'success')
        setSubStatus('subscribed')
      } else {
        addLog('⚠ No push subscription in browser — need to subscribe first', 'warn')
        setSubStatus('none')
      }
    } catch(e){ addLog(`❌ Error checking subscription: ${e.message}`, 'error') }
  }

  const doSubscribe = async () => {
    setLoading(true)
    addLog('Requesting notification permission...')
    try {
      await subscribe()
      addLog('✓ Subscribed successfully!', 'success')
      setSubStatus('subscribed')
    } catch(e){ addLog(`❌ Subscribe failed: ${e.message}`, 'error') }
    finally { setLoading(false) }
  }

  const sendTestPush = async () => {
    setLoading(true)
    addLog('Sending test push to your device...')
    try {
      const r = await api.post('push/test/', {})
      addLog(`✓ ${r.message}`, 'success')
    } catch(e){
      const msg = e.response?.data?.message || e.message
      addLog(`❌ ${msg}`, 'error')
    }
    finally { setLoading(false) }
  }

  const sendNewsletterTest = async () => {
    setLoading(true)
    addLog('Posting a test newsletter update...')
    try {
      await api.post('newsletter/manage/', {
        title: '🔔 Test Post - Push Working!',
        body: 'This is a test newsletter post to verify push notifications work.',
        category: 'general',
        emoji: '🔔',
        pinned: false,
      })
      addLog('✓ Newsletter posted — all subscribers should get a push!', 'success')
    } catch(e){ addLog(`❌ ${e.response?.data?.error || e.message}`, 'error') }
    finally { setLoading(false) }
  }

  const permState = () => {
    if(!('Notification' in window)) return '❌ Not supported'
    return Notification.permission === 'granted' ? '✅ Granted'
         : Notification.permission === 'denied'  ? '❌ Denied (must reset in browser settings)'
         : '⚠ Not yet asked'
  }

  return (
    <div style={{minHeight:'100vh', background:T.ink, color:T.bone, padding:'32px 20px', fontFamily:"'Courier Prime',monospace"}}>
      <style>{`*{box-sizing:border-box;} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{maxWidth:600, margin:'0 auto'}}>

        {/* Header */}
        <p style={{...mono, fontSize:9, color:T.blood, letterSpacing:'.5em', textTransform:'uppercase', marginBottom:8}}>
          ✦ Developer Tool
        </p>
        <h1 style={{...sf, fontSize:48, textTransform:'uppercase', letterSpacing:'-.02em', marginBottom:4}}>
          Push Test
        </h1>
        <p style={{...mono, fontSize:12, color:T.dim, marginBottom:32}}>
          Use this page to verify push notifications work end-to-end.
        </p>

        {/* Status cards */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24}}>
          {[
            { label:'Logged in as', val: user ? `${user.name || user.username} (${user.is_staff ? 'Barber' : 'Client'})` : 'Not logged in' },
            { label:'Browser permission', val: permState() },
            { label:'SW support', val: 'serviceWorker' in navigator ? '✅ Yes' : '❌ No' },
            { label:'Push support', val: 'PushManager' in window ? '✅ Yes' : '❌ No' },
          ].map(({label, val}) => (
            <div key={label} style={{background:T.ink2, border:`1px solid rgba(232,223,200,.1)`, borderRadius:'8px 5px 8px 5px', padding:'12px 14px'}}>
              <p style={{...mono, fontSize:8, color:T.dim, letterSpacing:'.3em', textTransform:'uppercase', marginBottom:4}}>{label}</p>
              <p style={{...mono, fontSize:11, color:T.bone, margin:0}}>{val}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:28}}>

          <button onClick={checkSubscription} disabled={loading} style={{
            padding:'14px', ...sf, fontSize:16, letterSpacing:'.15em', textTransform:'uppercase',
            background:'rgba(232,223,200,.06)', color:T.bone,
            border:`2px solid rgba(232,223,200,.2)`, borderRadius:PILL, cursor:'pointer',
          }}>
            1. Check Subscription Status
          </button>

          <button onClick={doSubscribe} disabled={loading} style={{
            padding:'14px', ...sf, fontSize:16, letterSpacing:'.15em', textTransform:'uppercase',
            background:'rgba(99,91,255,.12)', color:'#a78bfa',
            border:`2px solid rgba(99,91,255,.3)`, borderRadius:PILL, cursor:'pointer',
          }}>
            {loading ? '⏳ Working...' : '2. Subscribe to Push Notifications'}
          </button>

          <button onClick={sendTestPush} disabled={loading || !user} style={{
            padding:'14px', ...sf, fontSize:16, letterSpacing:'.15em', textTransform:'uppercase',
            background:T.greenDim, color:T.green,
            border:`2px solid ${T.greenBorder}`, borderRadius:PILL, cursor:'pointer',
          }}>
            {loading ? '⏳ Sending...' : '3. Send Test Push to THIS Device →'}
          </button>

          {user?.is_staff && (
            <button onClick={sendNewsletterTest} disabled={loading} style={{
              padding:'14px', ...sf, fontSize:16, letterSpacing:'.15em', textTransform:'uppercase',
              background:T.redDim, color:T.red,
              border:`2px solid ${T.redBorder}`, borderRadius:PILL, cursor:'pointer',
            }}>
              {loading ? '⏳ Posting...' : '4. Post Test Newsletter (pushes to ALL users)'}
            </button>
          )}
        </div>

        {/* Instructions */}
        <div style={{background:T.ink2, border:`1px solid rgba(232,223,200,.08)`, borderRadius:'8px', padding:'16px 18px', marginBottom:24}}>
          <p style={{...mono, fontSize:9, color:T.blood, letterSpacing:'.4em', textTransform:'uppercase', marginBottom:10}}>How to test</p>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[
              '1. Log into your client account on the phone browser',
              '2. Visit barbersnearme.xyz/push-test',
              '3. Tap "Check Subscription Status"',
              '4. If no subscription, tap "Subscribe to Push Notifications" and allow when asked',
              '5. Tap "Send Test Push to THIS Device" — you should get a notification within 5 seconds',
              '6. On your laptop as barber, post a newsletter — phone client should get notified',
            ].map((step, i) => (
              <p key={i} style={{...mono, fontSize:11, color:T.dim, margin:0, lineHeight:1.6}}>{step}</p>
            ))}
          </div>
        </div>

        {/* Log */}
        <div style={{background:'#000', border:`1px solid rgba(232,223,200,.08)`, borderRadius:'8px', padding:'16px', minHeight:120}}>
          <p style={{...mono, fontSize:9, color:T.dim, letterSpacing:'.4em', textTransform:'uppercase', marginBottom:12}}>Log</p>
          {log.length === 0
            ? <p style={{...mono, fontSize:11, color:'rgba(232,223,200,.2)'}}>No activity yet...</p>
            : log.map((entry, i) => (
              <div key={i} style={{display:'flex', gap:10, marginBottom:6, alignItems:'flex-start'}}>
                <span style={{...mono, fontSize:9, color:'rgba(232,223,200,.3)', flexShrink:0}}>{entry.time}</span>
                <span style={{...mono, fontSize:11, color:
                  entry.type==='success' ? T.green :
                  entry.type==='error'   ? T.red :
                  entry.type==='warn'    ? '#f59e0b' : T.dim,
                  lineHeight:1.5
                }}>{entry.msg}</span>
              </div>
            ))
          }
          {log.length > 0 && (
            <button onClick={()=>setLog([])} style={{...mono, fontSize:10, color:'rgba(232,223,200,.3)', background:'none', border:'none', cursor:'pointer', marginTop:8}}>
              Clear log
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
