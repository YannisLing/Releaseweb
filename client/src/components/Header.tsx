import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const location = useLocation()
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return '🕊️ 圣多娜释放法'
      case '/six-step': return '✨ 释放法黄金六步骤'
      case '/emotions': return '📋 情绪表'
      case '/records': return '📊 释放记录'
      default: return '🕊️ 圣多娜释放法'
    }
  }

  return (
    <>
      <header className="header">
        <h1>{getTitle()}</h1>
        <p>通过四个简单的问题，释放你的情绪负担</p>
      </header>
      <nav className="nav-tabs">
        <Link 
          to="/" 
          className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
        >
          释放练习
        </Link>
        <Link 
          to="/six-step" 
          className={`nav-tab ${location.pathname === '/six-step' ? 'active' : ''}`}
        >
          六步骤
        </Link>
        <Link 
          to="/emotions" 
          className={`nav-tab ${location.pathname === '/emotions' ? 'active' : ''}`}
        >
          情绪表
        </Link>
        <Link 
          to="/records" 
          className={`nav-tab ${location.pathname === '/records' ? 'active' : ''}`}
        >
          记录
        </Link>
      </nav>
    </>
  )
}
