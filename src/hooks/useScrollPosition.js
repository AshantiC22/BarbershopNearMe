import { useState, useEffect } from 'react'

/*
  useScrollPosition — returns current window scroll Y.
  Useful for navbar shadow, parallax, etc.
*/
export default function useScrollPosition() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = () => setY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return y
}
