import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

/* ── Register service worker ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        /* Check for updates every 60 seconds */
        setInterval(() => reg.update(), 30 * 1000)  // check every 30s
      })
      .catch(err => console.warn('[SW] registration failed:', err))

    /* When SW sends SW_UPDATED message → reload to get latest version */
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'SW_UPDATED') {
        console.log('[SW] New version available — reloading...')
        window.location.reload()
      }
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
