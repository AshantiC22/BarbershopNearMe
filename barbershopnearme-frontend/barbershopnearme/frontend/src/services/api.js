import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Attach JWT access token ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bsnm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ── Public routes — skip auto-refresh ── */
const PUBLIC = ['token/', 'token/refresh/', 'register/', 'barber/register/', 'barbers/', 'services/', 'available-slots/', 'security-questions/', 'recovery/']
const isPublic = (url = '') => PUBLIC.some(p => url.includes(p))

/* ── Response interceptor ── */
api.interceptors.response.use(
  (res) => res.data ?? res,
  async (err) => {
    const req = err.config
    if (!err.response) return Promise.reject(err)

    /* Auto-refresh on 401 for protected routes */
    if (err.response.status === 401 && !req._retry && !isPublic(req.url)) {
      req._retry = true
      const refresh = localStorage.getItem('bsnm_refresh')
      if (refresh) {
        try {
          const res = await axios.post(`${BASE}/token/refresh/`, { refresh }, { timeout: 8000 })
          const newAccess = res.data.access
          localStorage.setItem('bsnm_token', newAccess)
          if (res.data.refresh) localStorage.setItem('bsnm_refresh', res.data.refresh)
          req.headers.Authorization = `Bearer ${newAccess}`
          return api(req)
        } catch {
          localStorage.removeItem('bsnm_token')
          localStorage.removeItem('bsnm_refresh')
          localStorage.removeItem('bsnm_user')
        }
      }
      /* don't force-redirect — let each page handle auth failure */
    }

    /* normalise error message */
    const data = err.response?.data
    let message = 'Something went wrong.'
    if (typeof data === 'string')               message = data
    else if (data?.detail)                      message = data.detail
    else if (data?.non_field_errors)            message = data.non_field_errors[0]
    else if (data && typeof data === 'object') {
      const k = Object.keys(data)[0]
      if (k) { const v = data[k]; message = Array.isArray(v) ? v[0] : String(v) }
    }
    const error = new Error(message)
    error.response = err.response   // keep the response on the error for status checks
    return Promise.reject(error)
  }
)

export default api

/* ── Named exports ── */
export const bookAppointment   = (payload) => api.post('/appointments/', payload)
export const getMyAppointments = ()         => api.get('/appointments/?my=true')
export const cancelAppointment = (id)       => api.post(`/appointments/${id}/cancel/`)
export const getAvailableSlots = (barberId, date) => api.get(`/available-slots/?barber=${barberId}&date=${date}`)
export const getBarbers        = ()         => api.get('/barbers/')
export const getServices       = ()         => api.get('/services/')
export const authLogin         = (u, p)     => api.post('/token/', { username: u, password: p })
export const authSignup        = (name, email, password) => api.post('/register/', {
  username: name.trim().replace(/\s+/g, '_').toLowerCase(),
  email,
  password,
})
