import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import EmotionsPage from './pages/EmotionsPage'
import RecordsPage from './pages/RecordsPage'
import PracticeListPage from './pages/PracticeListPage'
import PracticeDetailPage from './pages/PracticeDetailPage'
import SixStepReleasePage from './pages/SixStepReleasePage'

function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<PracticeListPage />} />
          <Route path="/practice" element={<PracticeListPage />} />
          <Route path="/practice/:practiceId" element={<PracticeDetailPage />} />
          <Route path="/six-step" element={<SixStepReleasePage />} />
          <Route path="/emotions" element={<EmotionsPage />} />
          <Route path="/records" element={<RecordsPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App