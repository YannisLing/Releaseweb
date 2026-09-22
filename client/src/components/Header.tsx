import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return '释放练习'
      case '/six-step': return '黄金六步骤'
      case '/emotions': return '情绪表'
      case '/records': return '释放记录'
      case '/donate': return '支持开发者'
      default: return '释放练习'
    }
  }

  const tabs = [
    { to: '/', label: '练习', icon: '🕊' },
    { to: '/six-step', label: '六步', icon: '✨' },
    { to: '/emotions', label: '情绪', icon: '📋' },
    { to: '/records', label: '记录', icon: '📊' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/practice' || location.pathname.startsWith('/practice/')
    return location.pathname === path
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-title-group">
            <span className="header-eyebrow">圣 多 娜 释 放 法</span>
            <h1 className="header-title">{getTitle()}</h1>
          </div>
          {user && (
            <div className="user-info">
              <Link to="/donate" className="donate-btn" title="支持开发者">💝</Link>
              <span className="user-name">{user.name || user.email}</span>
              <button className="logout-btn" onClick={logout} title="退出登录">退出</button>
            </div>
          )}
        </div>
      </header>

      {/* 桌面端顶部 tab */}
      <nav className="nav-tabs nav-tabs-desktop">
        {tabs.map(t => (
          <Link
            key={t.to}
            to={t.to}
            className={`nav-tab ${isActive(t.to) ? 'active' : ''}`}
          >
            <span className="nav-tab-icon">{t.icon}</span>
            <span className="nav-tab-label">{t.label}</span>
          </Link>
        ))}
      </nav>

      {/* 移动端底部 tab（app 风格） */}
      <nav className="nav-tabs-mobile">
        {tabs.map(t => (
          <Link
            key={t.to}
            to={t.to}
            className={`mobile-tab ${isActive(t.to) ? 'active' : ''}`}
          >
            <span className="mobile-tab-icon">{t.icon}</span>
            <span className="mobile-tab-label">{t.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
