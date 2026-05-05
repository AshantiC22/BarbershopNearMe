import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import LoadingScreen      from '@/components/ui/LoadingScreen.jsx'
import BookNowTransition  from '@/components/ui/BookNowTransition.jsx'
import Home               from '@/pages/Home.jsx'
import { LoginPage, SignupPage, ForgotPasswordPage } from '@/pages/AuthPage.jsx'
import PortalPage         from '@/pages/PortalPage.jsx'
import DashboardPage      from '@/pages/DashboardPage.jsx'
import BarberLoginPage    from '@/pages/BarberLoginPage.jsx'
import BarberDashboardPage from '@/pages/BarberDashboardPage.jsx'
import NewsletterPage     from '@/pages/NewsletterPage.jsx'
import ReviewPage         from '@/pages/ReviewPage.jsx'
import ReschedulePage           from '@/pages/ReschedulePage.jsx'
import ClientReschedulePage    from '@/pages/ClientReschedulePage.jsx'
import TermsPage          from '@/pages/TermsPage.jsx'
import NotFound           from '@/pages/NotFound.jsx'
import PushTestPage       from '@/pages/PushTestPage.jsx'

/*
  PageWrap — no animation here.
  The LoadingScreen handles the site entrance.
  Individual pages handle their own internal animations.
  Removing opacity:0 animation prevents the blank black screen.
*/
function PageWrap({ children }) {
  return (
    <div style={{ background:'#070504', minHeight:'100vh' }}>
      {children}
    </div>
  )
}

function AppInner() {
  const navigate = useNavigate()
  const [showBookNow, setShowBookNow] = useState(false)

  if (showBookNow) {
    return (
      <BookNowTransition onDone={() => {
        setShowBookNow(false)
        requestAnimationFrame(() => requestAnimationFrame(() => navigate('/login')))
      }} />
    )
  }

  return (
    <Routes>
      <Route path="/"                 element={<PageWrap><Home onBookNow={() => setShowBookNow(true)} /></PageWrap>} />
      <Route path="/login"            element={<PageWrap><LoginPage /></PageWrap>} />
      <Route path="/signup"           element={<PageWrap><SignupPage /></PageWrap>} />
      <Route path="/forgot-password"  element={<PageWrap><ForgotPasswordPage /></PageWrap>} />
      <Route path="/portal"           element={<PageWrap><PortalPage /></PageWrap>} />
      <Route path="/dashboard"        element={<PageWrap><DashboardPage /></PageWrap>} />
      <Route path="/barber-login"     element={<PageWrap><BarberLoginPage /></PageWrap>} />
      <Route path="/barber-dashboard" element={<PageWrap><BarberDashboardPage /></PageWrap>} />
      <Route path="/newsletter"       element={<PageWrap><NewsletterPage /></PageWrap>} />
      <Route path="/review"           element={<PageWrap><ReviewPage /></PageWrap>} />
      <Route path="/reschedule"       element={<PageWrap><ReschedulePage /></PageWrap>} />
      <Route path="/my-reschedule"    element={<PageWrap><ClientReschedulePage /></PageWrap>} />
      <Route path="/terms"            element={<PageWrap><TermsPage /></PageWrap>} />
      <Route path="/push-test"        element={<PageWrap><PushTestPage /></PageWrap>} />
      <Route path="*"                 element={<PageWrap><NotFound /></PageWrap>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingScreen>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </LoadingScreen>
    </AuthProvider>
  )
}
