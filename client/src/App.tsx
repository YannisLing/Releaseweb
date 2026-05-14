import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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

function AppContent() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="main-content">
          <AuthPage onLoginSuccess={() => window.location.reload()} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="app-container">
      <div className="main-content">
        <Header />
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
