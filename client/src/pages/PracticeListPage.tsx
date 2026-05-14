import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from '../context/PracticeContext';
import './PracticeListPage.css';

export default function PracticeListPage() {
  const navigate = useNavigate();
  const { practices, isLoading } = usePractice();
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);

  useEffect(() => {
    const index = practices.findIndex(p => !p.completed);
    setCurrentPracticeIndex(index >= 0 ? index : practices.length - 1);
  }, [practices]);

  const getProgressPercentage = () => {
    const completed = practices.filter(p => p.completed).length;
    return Math.round((completed / practices.length) * 100);
  };

  const isPracticeAvailable = (index: number) => {
    if (index === 0) return true;
    const previousPractice = practices[index - 1];
    return previousPractice.completed;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载练习进度中...</p>
      </div>
    );
  }

  return (
    <div className="practice-list-page">
      <div className="page-header">
        <h1>圣多纳释放法练习册</h1>
        <div className="progress-summary">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <span className="progress-text">{getProgressPercentage()}% 完成</span>
          </div>
        </div>
      </div>

      <div className="practices-container">
        {practices.map((practice, index) => {
          const isAvailable = isPracticeAvailable(index);
          const isActive = index === currentPracticeIndex && isAvailable;
          
          return (
            <div
              key={practice.id}
              className={`practice-card ${
                !isAvailable ? 'locked' : ''
              } ${practice.completed ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => isAvailable && navigate(`/practice/${practice.id}`)}
            >
              <div className="practice-card-header">
                <div className="practice-number">{index + 1}</div>
                <div className="practice-status">
                  {practice.completed ? null : (
                    isAvailable ? (
                      <span className="status-available">● 可开始</span>
                    ) : (
                      <span className="status-locked">🔒 未解锁</span>
                    )
                  )}
                </div>
              </div>
              
              <div className="practice-card-body">
                <h3>{practice.name}</h3>
                <p className="practice-description">{practice.description}</p>
                <div className="practice-meta">
                  <span className="practice-pages">{practice.pages}</span>
                  <span className="practice-attempts">
                    {practice.attemptsRequired > 1 
                      ? `需要完成 ${practice.attemptsRequired} 次` 
                      : '需要完成 1 次'}
                  </span>
                  {practice.completed && (
                    <span className="practice-done">
                      已完成 {practice.attemptsMade}/{practice.attemptsRequired}
                    </span>
                  )}
                </div>
              </div>

              {practice.completed && (
                <div className="practice-completion-badge">
                  完成！
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="footer-hint">
        <p>💡 提示：必须完成前一个练习才能开始下一个练习</p>
      </div>
    </div>
  );
}
