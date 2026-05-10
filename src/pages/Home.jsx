import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="home-container">
      <nav className="nav-bar">
        <div className="nav-logo">
          <Link to="/">圣多娜释放法</Link>
        </div>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span className="user-info">欢迎，{user?.email}</span>
              <button onClick={handleLogout} className="logout-button">登出</button>
              <Link to="/practice" className="nav-button">开始练习</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">登录</Link>
              <Link to="/register" className="nav-button primary">注册</Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero-section">
        <h1>圣多娜释放法</h1>
        <p>通过简单的步骤，释放内心的负面情绪，找回内心的平静与自由</p>
        {isAuthenticated ? (
          <Link to="/practice" className="cta-button">开始练习</Link>
        ) : (
          <Link to="/register" className="cta-button">立即注册</Link>
        )}
      </section>
      
      <section className="intro-section">
        <h2>什么是圣多娜释放法？</h2>
        <p>圣多娜释放法是一种简单而强大的情绪释放技术，由莱斯特·利文森（Lester Levenson）创立。它通过引导你识别、感受并释放负面情绪，帮助你达到内心的平静与自由。</p>
        <p>这种方法的核心在于认识到我们的情绪是可以被释放的，而不是被压抑或忽视。通过持续练习，你可以逐渐减轻心理负担，提高生活质量。</p>
      </section>
      
      <section className="benefits-section">
        <h2>练习的好处</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>减轻压力</h3>
            <p>通过释放负面情绪，有效减轻日常压力</p>
          </div>
          <div className="benefit-card">
            <h3>改善情绪</h3>
            <p>提升积极情绪，减少焦虑和抑郁</p>
          </div>
          <div className="benefit-card">
            <h3>增强自我意识</h3>
            <p>更清楚地了解自己的情绪模式</p>
          </div>
          <div className="benefit-card">
            <h3>提高专注力</h3>
            <p>减少内心杂念，提高工作和学习效率</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;