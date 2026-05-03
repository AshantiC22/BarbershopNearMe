import { createContext, useContext, useState, useEffect } from 'react'

/*
  AuthContext
  ───────────
  Lightweight client-side auth store.
  Persists user to localStorage so they stay logged in on refresh.

  When you add a real backend later, swap the login/signup/logout
  functions to call your Spring Boot JWT endpoints — the rest of
  the app doesn't need to change.
*/

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bsnm_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  /* persist on change */
  useEffect(() => {
    if (user) localStorage.setItem('bsnm_user', JSON.stringify(user))
    else      localStorage.removeItem('bsnm_user')
  }, [user])

  /* ── mock login — replace with real API call later ── */
  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      await new Promise(r => setTimeout(r, 800)) /* fake network delay */
      if (!email || !password) throw new Error('Please fill in all fields.')
      const mockUser = { id: 1, name: email.split('@')[0], email }
      setUser(mockUser)
      return mockUser
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setLoading(false)
    }
  }

  /* ── mock signup ── */
  const signup = async (name, email, password) => {
    setLoading(true); setError(null)
    try {
      await new Promise(r => setTimeout(r, 900))
      if (!name || !email || !password) throw new Error('Please fill in all fields.')
      if (password.length < 6) throw new Error('Password must be at least 6 characters.')
      const newUser = { id: Date.now(), name, email }
      setUser(newUser)
      return newUser
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setLoading(false)
    }
  }

  const logout = () => setUser(null)
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
