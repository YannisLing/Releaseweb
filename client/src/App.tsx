import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PracticeProvider } from './context/PracticeContext'
import Background from './components/Background'
import Header from './components/Header'
import EmotionsPage from './pages/EmotionsPage'
import RecordsPage from './pages/RecordsPage'
import PracticeListPage from './pages/PracticeListPage'
import PracticeDetailPage from './pages/PracticeDetailPage'
import SixStepReleasePage from './pages/SixStepReleasePage'
import AuthPage from './pages/AuthPage'
import DonatePage from './pages/DonatePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => window.location.reload()} />
  }

  return <>{children}</>
}

// 导航顺序，用于判断切换方向
const TAB_ORDER = ['/', '/six-step', '/emotions', '/records', '/donate']

function getPageDepth(pathname: string): number {
  // /practice 系列归入首页 tab
  if (pathname === '/' || pathname.startsWith('/practice')) return 0
  const idx = TAB_ORDER.indexOf(pathname)
  return idx === -1 ? 0 : idx
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [transitionDir, setTransitionDir] = useState<'forward' | 'backward'>('forward')
  const prevDepthRef = useRef(0)

  useEffect(() => {
    const depth = getPageDepth(location.pathname)
    if (depth > prevDepthRef.current) {
      setTransitionDir('forward')
    } else if (depth < prevDepthRef.current) {
      setTransitionDir('backward')
    }
    prevDepthRef.current = depth
  }, [location.pathname])

  if (!isAuthenticated) {
    return (
      <>
        <Background />
        <div className="app-container">
          <div className="main-content">
            <AuthPage onLoginSuccess={() => window.location.reload()} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Background />
      <PracticeProvider>
        <div className="app-container">
          <div className="main-content">
            <Header />
            <div key={location.pathname} className={`page-transition ${transitionDir}`}>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <PracticeListPage />
                </ProtectedRoute>
              } />
              <Route path="/practice" element={
                <ProtectedRoute>
                  <PracticeListPage />
                </ProtectedRoute>
              } />
              <Route path="/practice/:practiceId" element={
                <ProtectedRoute>
                  <PracticeDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/six-step" element={
                <ProtectedRoute>
                  <SixStepReleasePage />
                </ProtectedRoute>
              } />
              <Route path="/emotions" element={
                <ProtectedRoute>
                  <EmotionsPage />
                </ProtectedRoute>
              } />
              <Route path="/records" element={
                <ProtectedRoute>
                  <RecordsPage />
                </ProtectedRoute>
              } />
              <Route path="/donate" element={<DonatePage />} />
            </Routes>
            </div>
          </div>
        </div>
      </PracticeProvider>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
