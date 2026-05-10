import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // 简单的表单验证
    if (!email || !password) {
      setError('请填写所有必填字段');
      return;
    }

    // 模拟登录
    const success = login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('邮箱或密码错误');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>登录</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          <button type="submit" className="auth-button">登录</button>
        </form>
        <div className="auth-footer">
          <p>还没有账号？ <Link to="/register">注册</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;