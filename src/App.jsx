import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import LoadingScreen from '@/components/ui/LoadingScreen.jsx'
import Home from '@/pages/Home.jsx'
import { LoginPage, SignupPage } from '@/pages/AuthPage.jsx'
import PortalPage from '@/pages/PortalPage.jsx'
import NotFound from '@/pages/NotFound.jsx'

/* Wrap each route element in a smooth fade-in div */
function PageWrap({ children }) {
  return (
    <div style={{
      animation: 'pageEntry .5s cubic-bezier(.16,1,.3,1) both',
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LoadingScreen>
        <BrowserRouter>
          <Routes>
            <Route path="/"       element={<PageWrap><Home /></PageWrap>} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/portal" element={<PageWrap><PortalPage /></PageWrap>} />
            <Route path="*"       element={<PageWrap><NotFound /></PageWrap>} />
          </Routes>
        </BrowserRouter>
      </LoadingScreen>
    </AuthProvider>
  )
}
