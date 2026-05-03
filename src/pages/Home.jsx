import Navbar   from '@/components/layout/Navbar.jsx'
import Footer   from '@/components/layout/Footer.jsx'
import Hero     from '@/components/sections/Hero.jsx'
import Ticker   from '@/components/sections/Ticker.jsx'
import Services from '@/components/sections/Services.jsx'
import Barbers  from '@/components/sections/Barbers.jsx'
import Booking  from '@/components/sections/Booking.jsx'

/*
  Home page — assembles all sections in order.
  When backend is ready, you can fetch data here and
  pass it down as props to Services, Barbers, etc.
*/
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Services />
        <Barbers />
        <Booking />
      </main>
      <Footer />
    </>
  )
}
