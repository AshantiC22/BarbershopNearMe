/*
  Shared utility functions.
  Keep pure — no React imports here.
*/

/**
 * Format a date string for display.
 * @param {string} dateStr ISO date
 * @returns {string} e.g. "Monday, May 12"
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

/**
 * Linear interpolation — used in canvas animations.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Ease in-out quad — smooth animation helper.
 */
export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
