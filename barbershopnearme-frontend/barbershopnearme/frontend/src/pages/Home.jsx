import Navbar    from '@/components/layout/Navbar.jsx'
import Footer    from '@/components/layout/Footer.jsx'
import Hero      from '@/components/sections/Hero.jsx'
import Ticker    from '@/components/sections/Ticker.jsx'
import Services  from '@/components/sections/Services.jsx'
import Barbers   from '@/components/sections/Barbers.jsx'
import Gallery   from '@/components/sections/Gallery.jsx'
import Reviews   from '@/components/sections/Reviews.jsx'
import Location  from '@/components/sections/Location.jsx'

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
    </>
  )
}
