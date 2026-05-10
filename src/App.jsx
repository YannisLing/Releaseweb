import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { useStore } from './store';
import './App.css';

// 保护路由组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/practice" 
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;