import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './Practice.css';

const Practice = () => {
  const { currentLevel, completedLevels, completeLevel, isAuthenticated, user, logout } = useStore();
  const [currentEvent, setCurrentEvent] = useState('');
  const [feelings, setFeelings] = useState([]);
  const [newFeeling, setNewFeeling] = useState('');
  const [releasedFeelings, setReleasedFeelings] = useState([]);
  const navigate = useNavigate();

  // 关卡数据
  const levels = [
    {
      id: 1,
      title: '基础练习',
      description: '学习识别和释放基本情绪',
      events: [
        '今天遇到的小挫折',
        '最近让你感到压力的事情',
        '与他人的小冲突'
      ]
    },
    {
      id: 2,
      title: '深入探索',
      description: '探索更深层次的情绪模式',
      events: [
        '童年时期的记忆',
        '与家人的关系',
        '工作中的挑战'
      ]
    },
    {
      id: 3,
      title: '自我成长',
      description: '释放阻碍个人成长的情绪',
      events: [
        '对未来的担忧',
        '自我怀疑的时刻',
        '过去的遗憾'
      ]
    }
  ];

  const currentLevelData = levels.find(level => level.id === currentLevel) || levels[0];

  const addFeeling = () => {
    if (newFeeling.trim()) {
      setFeelings([...feelings, newFeeling.trim()]);
      setNewFeeling('');
    }
  };

  const releaseFeeling = (feeling) => {
    setReleasedFeelings([...releasedFeelings, feeling]);
    setFeelings(feelings.filter(f => f !== feeling));
  };

  const handleCompleteLevel = () => {
    completeLevel();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="practice-container">
      <div className="sidebar">
        <div className="user-info-section">
          <h3>欢迎，{user?.email}</h3>
          <button onClick={handleLogout} className="logout-button">登出</button>
        </div>
        <h2>练习进度</h2>
        <div className="level-list">
          {levels.map(level => (
            <div 
              key={level.id} 
              className={`level-item ${level.id === currentLevel ? 'active' : ''} ${completedLevels.includes(level.id) ? 'completed' : ''}`}
            >
              <span className="level-number">{level.id}</span>
              <div className="level-info">
                <h3>{level.title}</h3>
                <p>{level.description}</p>
              </div>
              {completedLevels.includes(level.id) && <span className="checkmark">✓</span>}
            </div>
          ))}
        </div>
        <Link to="/" className="back-button">返回首页</Link>
      </div>

      <div className="main-content">
        <div className="level-header">
          <h1>关卡 {currentLevel}: {currentLevelData.title}</h1>
          <p>{currentLevelData.description}</p>
        </div>

        <div className="practice-workbook">
          <div className="workbook-section">
            <h2>事件描述</h2>
            <textarea 
              value={currentEvent}
              onChange={(e) => setCurrentEvent(e.target.value)}
              placeholder="请描述你想要释放的事件..."
              className="event-input"
            />
            <div className="event-suggestions">
              <h3>建议事件</h3>
              <div className="suggestion-list">
                {currentLevelData.events.map((event, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentEvent(event)}
                    className="suggestion-button"
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="workbook-section">
            <h2>感受记录</h2>
            <div className="feelings-input">
              <input 
                type="text"
                value={newFeeling}
                onChange={(e) => setNewFeeling(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeeling()}
                placeholder="输入你的感受..."
                className="feeling-input"
              />
              <button onClick={addFeeling} className="add-feeling-button">添加</button>
            </div>
            <div className="feelings-list">
              {feelings.map((feeling, index) => (
                <div key={index} className="feeling-item">
                  <span>{feeling}</span>
                  <button 
                    onClick={() => releaseFeeling(feeling)}
                    className="release-button"
                  >
                    释放
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="workbook-section">
            <h2>已释放的感受</h2>
            <div className="released-list">
              {releasedFeelings.map((feeling, index) => (
                <div key={index} className="released-item">
                  <span>{feeling}</span>
                  <span className="released-checkmark">✓</span>
                </div>
              ))}
            </div>
          </div>

          <div className="completion-section">
            <button 
              onClick={handleCompleteLevel}
              className="complete-level-button"
              disabled={releasedFeelings.length === 0}
            >
              完成关卡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;