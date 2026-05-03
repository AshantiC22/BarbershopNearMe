import axios from 'axios'

/*
  API service layer — all calls to the Spring Boot backend go here.
  Base URL comes from .env so it works across dev / prod / staging.

  Dev:  proxy in vite.config.js forwards /api → http://localhost:8080
  Prod: set VITE_API_BASE_URL in your hosting environment
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

/* ── Request interceptor — attach auth token when present ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ── Response interceptor — normalise errors ── */
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

/* ── APPOINTMENTS ── */

/**
 * Book a new appointment.
 * @param {{ name: string, service: string, barber: string, date: string, time: string }} payload
 */
export const bookAppointment = (payload) =>
  api.post('/appointments', payload)

/**
 * Get all appointments (admin use).
 */
export const getAppointments = () =>
  api.get('/appointments')

/**
 * Get available time slots for a given barber + date.
 * @param {string} barber
 * @param {string} date  ISO date string (YYYY-MM-DD)
 */
export const getAvailableSlots = (barber, date) =>
  api.get('/appointments/available', { params: { barber, date } })

/* ── SERVICES ── */

/**
 * Get all barbershop services from the backend.
 */
export const getServices = () =>
  api.get('/services')

/* ── BARBERS ── */

/**
 * Get all barbers.
 */
export const getBarbers = () =>
  api.get('/barbers')

export default api
