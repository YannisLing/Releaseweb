import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ALL_PRACTICES, type Practice } from '../data/workbookPractices';
import { api } from '../services/api';
import './PracticeListPage.css';

export default function PracticeListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [practices, setPractices] = useState<Practice[]>(ALL_PRACTICES);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const updatedPractices = [...ALL_PRACTICES];
      
      for (let i = 0; i < updatedPractices.length; i++) {
        const practice = updatedPractices[i];
        const progress = await api.getPracticeProgress(practice.id);
        
        if (progress) {
          updatedPractices[i] = {
            ...practice,
            attemptsMade: progress.attempts_made,
            completed: progress.completed === 1
          };
        }
      }
      
      setPractices(updatedPractices);
    } catch (error) {
      console.error('Error loading practice progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [location.key]);

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

  if (loading) {
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
                  {practice.completed ? (
                    <span className="status-completed">✓ 已完成</span>
                  ) : isAvailable ? (
                    <span className="status-available">● 可开始</span>
                  ) : (
                    <span className="status-locked">🔒 未解锁</span>
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