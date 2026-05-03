import { useEffect } from 'react'

/*
  useReveal — attaches an IntersectionObserver to every .reveal element
  inside the given ref. When they enter the viewport, adds .in to trigger
  the CSS transition defined in index.css.

  Usage:
    const ref = useRef()
    useReveal(ref)
    return <section ref={ref}><div className="reveal">...</div></section>
*/
export default function useReveal(ref, options = {}) {
  useEffect(() => {
    if (!ref.current) return
    const els = ref.current.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            /* stagger with requestAnimationFrame for buttery smooth paint */
            const delay = i * 60
            if (delay === 0) {
              requestAnimationFrame(() => entry.target.classList.add('in'))
            } else {
              setTimeout(() => requestAnimationFrame(() => entry.target.classList.add('in')), delay)
            }
            io.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -40px 0px', /* fires slightly before element is fully visible */
        ...options
      }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}
