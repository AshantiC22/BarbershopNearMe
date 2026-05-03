import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/services/api.js'

/*
  AuthContext — wired to Django DRF + SimpleJWT backend.
  Token keys match the HeadzUp template: 'access' and 'refresh'.
*/
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { subscribe, unsubscribe } = usePushNotifications()
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsnm_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // api.js interceptor reads bsnm_token on every request — no manual header needed here

  function storeSession(access, refresh, userData) {
    localStorage.setItem('bsnm_token',   access)
    localStorage.setItem('bsnm_refresh', refresh)
    localStorage.setItem('bsnm_user', JSON.stringify(userData))
    // token stored — api.js interceptor picks it up automatically
    setUser(userData)
    // subscribe to push notifications after login
    setTimeout(() => subscribe().catch(() => {}), 2000)
  }

  function clearSession() {
    unsubscribe().catch(() => {})
    localStorage.removeItem('bsnm_token')
    localStorage.removeItem('bsnm_refresh')
    localStorage.removeItem('bsnm_user')
    // tokens cleared — api.js interceptor will find nothing
    setUser(null)
  }

  /* ── LOGIN ── */
  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      if (!email?.trim() || !password) throw new Error('Please fill in all fields.')
      /* Django token endpoint accepts username — email IS username here */
      const data = await api.post('token/', {
        username: email.trim().toLowerCase(),
        password,
      })
      const payload  = JSON.parse(atob(data.access.split('.')[1]))
      const userData = {
        id:       payload.user_id,
        name:     payload.username || email.split('@')[0],
        email:    email.trim().toLowerCase(),
        is_staff: payload.is_staff || false,
      }
      storeSession(data.access, data.refresh, userData)
      return userData
    } catch(e) {
      setError(e.message); throw e
    } finally { setLoading(false) }
  }

  /* ── SIGNUP ── */
  const signup = async (name, email, password, username) => {
    setLoading(true); setError(null)
    try {
      if (!name?.trim() || !email?.trim() || !password) throw new Error('Please fill in all fields.')
      if (password.length < 6) throw new Error('Password must be at least 6 characters.')
      const uname = username || name.trim().replace(/\s+/g,'_').toLowerCase()
      await api.post('register/', { username: uname, email: email.trim().toLowerCase(), password })
      const data = await api.post('token/', { username: uname, password })
      const payload = JSON.parse(atob(data.access.split('.')[1]))
      const userData = { id:payload.user_id, name:name.trim(), email:email.trim().toLowerCase(), is_staff:!!payload.is_staff }
      storeSession(data.access, data.refresh, userData)
      return userData
    } catch(e){ setError(e.message); throw e }
    finally{ setLoading(false) }
  }

  const logout     = () => clearSession()
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
