import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_PRACTICES, type Practice, type Exercise, type Event, type Feeling } from '../data/workbookPractices';
import { emotionCategories } from '../data/emotions';
import { api } from '../services/api';
import BreatheCircle from '../components/BreatheCircle';
import './PracticeDetailPage.css';

type ReleaseState = {
  active: boolean;
  eventId: string | null;
  feelingId: string | null;
  feelingName: string;
  step: number;
};

export default function PracticeDetailPage() {
  const { practiceId } = useParams<{ practiceId: string }>();
  const navigate = useNavigate();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [releaseState, setReleaseState] = useState<ReleaseState>({
    active: false,
    eventId: null,
    feelingId: null,
    feelingName: '',
    step: 0
  });
  const [showEmotionPicker, setShowEmotionPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWant, setSelectedWant] = useState<string | null>(null);

  const loadPracticeData = async () => {
    if (!practiceId) return;

    setLoading(true);
    try {
      const foundPractice = ALL_PRACTICES.find(p => p.id === practiceId);
      if (!foundPractice) return;

      const progress = await api.getPracticeProgress(practiceId);
      const practiceWithProgress = {
        ...foundPractice,
        attemptsMade: progress?.attempts_made || 0,
        completed: progress?.completed === 1 || false
      };

      for (let i = 0; i < practiceWithProgress.exercises.length; i++) {
        const exercise = practiceWithProgress.exercises[i];
        const events = await api.getEvents(practiceId);

        const exerciseEvents = events.filter((event: any) =>
          event.exercise_id === exercise.id
        );

        const eventsWithFeelings = await Promise.all(
          exerciseEvents.map(async (event: any) => {
            const feelings = await api.getFeelings(event.id);
            return {
              id: event.id.toString(),
              situation: event.situation,
              feelings: feelings.map((f: any) => ({
                id: f.id.toString(),
                name: f.name,
                released: f.released === 1,
                feelingGood: f.feeling_good === 1
              })),
              completed: event.completed === 1
            };
          })
        );

        practiceWithProgress.exercises[i] = {
          ...exercise,
          events: eventsWithFeelings
        };
      }

      setPractice(practiceWithProgress);
      setCurrentAttempt(practiceWithProgress.attemptsMade + 1);
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPracticeData();
  }, [practiceId]);

  const currentExercise = practice?.exercises[currentExerciseIndex];

  const addEvent = useCallback(async () => {
    if (!practice || !currentExercise) return;

    try {
      const newEvent = await api.createEvent({
        practiceId: practice.id,
        exerciseId: currentExercise.id,
        situation: ''
      });

      const updatedEvent: Event = {
        id: newEvent.id.toString(),
        situation: newEvent.situation || '',
        feelings: [],
        completed: false
      };

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: [...currentExercise.events, updatedEvent]
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );

      setPractice({
        ...practice,
        exercises: updatedExercises
      });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!practice || !currentExercise) return;

    try {
      await api.deleteEvent(eventId);

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: currentExercise.events.filter(e => e.id !== eventId)
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );

      setPractice({
        ...practice,
        exercises: updatedExercises
      });
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const toggleEventCompleted = useCallback(async (eventId: string) => {
    if (!practice || !currentExercise) return;

    try {
      const event = currentExercise.events.find(e => e.id === eventId);
      if (!event) return;

      const newCompleted = !event.completed;
      await api.updateEvent(eventId, { completed: newCompleted });

      const updatedEvents = currentExercise.events.map(e => {
        if (e.id !== eventId) return e;
        return { ...e, completed: newCompleted };
      });

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: updatedEvents
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );

      setPractice({
        ...practice,
        exercises: updatedExercises
      });
    } catch (error) {
      console.error('Error toggling event completion:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const deleteFeeling = useCallback(async (eventId: string, feelingId: string) => {
    if (!practice || !currentExercise) return;

    try {
      await api.deleteFeeling(feelingId);

      const updatedEvents = currentExercise.events.map(event => {
        if (event.id !== eventId) return event;
        return {
          ...event,
          feelings: event.feelings.filter(f => f.id !== feelingId)
        };
      });

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: updatedEvents
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );


      setPractice({
        ...practice,
        exercises: updatedExercises
      });
    } catch (error) {
      console.error('Error deleting feeling:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const updateEventSituation = useCallback(async (eventId: string, situation: string) => {
    if (!practice || !currentExercise) return;

    const updatedEvents = currentExercise.events.map(event =>
      event.id === eventId ? { ...event, situation } : event
    );

    const updatedExercise: Exercise = {
      ...currentExercise,
      events: updatedEvents
    };

    const updatedExercises = practice.exercises.map((e, i) =>
      i === currentExerciseIndex ? updatedExercise : e
    );

    setPractice({
      ...practice,
      exercises: updatedExercises
    });

    try {
      await api.updateEvent(eventId, { situation });
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const addFeelingToEvent = useCallback(async (eventId: string, feelingName: string) => {
    if (!practice || !currentExercise) return;

    try {
      const newFeeling = await api.createFeeling({
        eventId,
        name: feelingName
      });

      const updatedFeeling: Feeling = {
        id: newFeeling.id.toString(),
        name: newFeeling.name,
        released: false,
        feelingGood: false
      };

      const updatedEvents = currentExercise.events.map(event =>
        event.id === eventId
          ? { ...event, feelings: [...event.feelings, updatedFeeling] }
          : event
      );

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: updatedEvents
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );

      setPractice({
        ...practice,
        exercises: updatedExercises
      });
    } catch (error) {
      console.error('Error adding feeling:', error);
    }
  }, [practice, currentExercise, currentExerciseIndex]);

  const startRelease = (eventId: string, feeling: Feeling) => {
    setSelectedWant(null);
    setReleaseState({
      active: true,
      eventId,
      feelingId: feeling.id,
      feelingName: feeling.name,
      step: 0
    });
  };

  const nextReleaseStep = () => {
    setReleaseState(prev => ({
      ...prev,
      step: prev.step + 1
    }));
  };

  const resetToFirstStep = () => {
    setReleaseState(prev => ({
      ...prev,
      step: 0
    }));
  };

  const completeRelease = useCallback(async () => {
    if (!practice || !currentExercise || !releaseState.eventId || !releaseState.feelingId) return;

    try {
      await api.saveRecord({
        feelingName: releaseState.feelingName,
        intensity: 5,
        note: `练习 ${practice.name}`
      });

      await api.updateFeeling(releaseState.feelingId, {
        released: true,
        feelingGood: true
      });

      const updatedEvents = currentExercise.events.map(event => {
        if (event.id !== releaseState.eventId) return event;

        const updatedFeelings = event.feelings.map(feeling => {
          if (feeling.id !== releaseState.feelingId) return feeling;
          return { ...feeling, released: true, feelingGood: true };
        });

        const allFeelingsGood = updatedFeelings.every(f => f.feelingGood);
        return { ...event, feelings: updatedFeelings, completed: allFeelingsGood };
      });

      const eventToUpdate = updatedEvents.find(e => e.id === releaseState.eventId);
      if (eventToUpdate?.completed) {
        await api.updateEvent(releaseState.eventId, { completed: true });
      }

      const updatedExercise: Exercise = {
        ...currentExercise,
        events: updatedEvents
      };

      const updatedExercises = practice.exercises.map((e, i) =>
        i === currentExerciseIndex ? updatedExercise : e
      );

      setPractice({
        ...practice,
        exercises: updatedExercises
      });

      setReleaseState({
        active: false,
        eventId: null,
        feelingId: null,
        feelingName: '',
        step: 0
      });
    } catch (error) {
      console.error('Error completing release:', error);
      alert('释放失败，请重试');
    }
  }, [practice, currentExercise, releaseState, currentExerciseIndex]);

  const cancelRelease = () => {
    setReleaseState({
      active: false,
      eventId: null,
      feelingId: null,
      feelingName: '',
      step: 0
    });
  };

  const goToNextExercise = () => {
    if (!practice) return;

    if (currentExerciseIndex < practice.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      completeCurrentAttempt();
    }
  };

  const completeCurrentAttempt = async () => {
    if (!practice) return;

    try {
      const newAttemptsMade = practice.attemptsMade + 1;
      const isCompleted = newAttemptsMade >= practice.attemptsRequired;

      await api.updatePracticeProgress(practice.id, {
        attemptsMade: newAttemptsMade,
        attemptsRequired: practice.attemptsRequired,
        completed: isCompleted
      });

      setPractice({
        ...practice,
        attemptsMade: newAttemptsMade,
        completed: isCompleted
      });

      if (isCompleted) {
        navigate('/practice');
      } else {
        setCurrentAttempt(currentAttempt + 1);
        setCurrentExerciseIndex(0);
      }
    } catch (error) {
      console.error('Error completing attempt:', error);
    }
  };

  const goBack = () => {
    navigate('/practice');
  };

  const renderReleaseFlow = () => {
    if (!releaseState.active) return null;

    const steps = [
      { num: 0, question: '感受这个情绪', showBreathe: true },
      { num: 1, question: '你能让这种感觉离开吗？', showBreathe: true },
      { num: 2, question: '如果能，你愿意让它离开吗？', showBreathe: true },
      { num: 3, question: '你什么时候让它离开呢？', showBreathe: true },
      { num: 4, question: '这种感受还在吗？', showBreathe: true }
    ];

    const currentStepData = steps[releaseState.step];

    const threeWants = ['想要认同/被爱', '想要控制', '想要安全/生存'];

    return (
      <div className="release-modal">
        <div className="release-flow">
          <div className="release-header">
            <h2>释放感受：{releaseState.feelingName}</h2>
            <button className="close-btn" onClick={cancelRelease}>×</button>
          </div>

          <div className="release-progress">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${releaseState.step >= i ? 'active' : ''} ${releaseState.step === i ? 'current' : ''}`}
              />
            ))}
          </div>

          <div className="release-step">
            <div className="step-number">步骤 {currentStepData.num + 1}/{steps.length}</div>
            <div className="release-question">{currentStepData.question}</div>

            <BreatheCircle />

            {releaseState.step === 0 && (
              <div className="three-wants-release-section">
                <p className="wants-intro-release">这个感受背后是什么想要？</p>
                <div className="wants-buttons-release">
                  {threeWants.map((want, i) => (
                    <button
                      key={i}
                      className={`want-btn-release ${selectedWant === want ? 'selected' : ''}`}
                      onClick={() => setSelectedWant(want)}
                    >
                      {want}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {releaseState.step < 4 ? (
              <div className="release-buttons">
                <button className="btn btn-secondary" onClick={cancelRelease}>
                  取消
                </button>
                <button className="btn btn-primary" onClick={nextReleaseStep}>
                  继续 →
                </button>
              </div>
            ) : (
              <div className="release-buttons release-complete">
                <button className="btn btn-outline" onClick={resetToFirstStep}>
                  还有一些
                </button>
                <button className="btn btn-success" onClick={completeRelease}>
                  完成释放 ✓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmotionPicker = (eventId: string) => {
    if (showEmotionPicker !== eventId) return null;

    return (
      <div className="emotion-picker-modal" onClick={() => setShowEmotionPicker(null)}>
        <div className="emotion-picker" onClick={e => e.stopPropagation()}>
          <h3>选择感受</h3>
          {emotionCategories.map(cat => (
            <div key={cat.id} className="emotion-category">
              <h4>{cat.emoji} {cat.name}</h4>
              <div className="emotion-grid">
                {cat.emotions.map((em, i) => (
                  <button
                    key={i}
                    className="emotion-option"
                    onClick={() => {
                      addFeelingToEvent(eventId, em);
                      setShowEmotionPicker(null);
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            className="close-picker-btn"
            onClick={() => setShowEmotionPicker(null)}
          >
            关闭
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载练习数据中...</p>
      </div>
    );
  }

  if (!practice || !currentExercise) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="practice-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={goBack}>
          ← 返回练习列表
        </button>
        <div className="practice-info">
          <h1>{practice.name}</h1>
          <div className="practice-meta">
            <span className="pages">{practice.pages}</span>
            <span className="attempt">
              第 {currentAttempt}/{practice.attemptsRequired} 次
            </span>
          </div>
        </div>
      </div>

      <div className="exercise-tabs">
        {practice.exercises.map((ex, i) => (
          <button
            key={ex.id}
            className={`tab-btn ${i === currentExerciseIndex ? 'active' : ''}`}
            onClick={() => setCurrentExerciseIndex(i)}
          >
            {ex.name}
          </button>
        ))}
      </div>

      <div className="exercise-description">
        <p>{currentExercise.description}</p>
      </div>

      <div className="events-container">
        {currentExercise.events.map(event => (
          <div key={event.id} className={`event-card ${event.completed ? 'completed' : ''}`}>
            <div className="event-header">
              <input
                type="text"
                value={event.situation}
                onChange={(e) => updateEventSituation(event.id, e.target.value)}
                onBlur={() => {
                  if (practice && currentExercise) {
                    const localEvent = currentExercise.events.find(ev => ev.id === event.id);
                    if (localEvent && localEvent.situation !== event.situation) {
                      api.updateEvent(event.id, { situation: event.situation });
                    }
                  }
                }}
                placeholder="输入事件..."
                className="event-input"
              />
              <button
                className="add-feeling-btn"
                onClick={() => setShowEmotionPicker(event.id)}
              >
                + 添加感受
              </button>
              <button
                className="delete-event-btn"
                onClick={() => deleteEvent(event.id)}
                title="删除事件"
              >
                删除
              </button>
            </div>

            {renderEmotionPicker(event.id)}

            <div className="feelings-list">
              {event.feelings.map(feeling => (
                <div key={feeling.id} className={`feeling-item ${feeling.feelingGood ? 'released' : ''}`}>
                  <div className="feeling-name">
                    {feeling.feelingGood ? (
                      <span className="released-text">✓ {feeling.name}</span>
                    ) : (
                      feeling.name
                    )}
                  </div>

                  {!feeling.released ? (
                    <div className="feeling-actions">
                      <button
                        className="release-btn"
                        onClick={() => startRelease(event.id, feeling)}
                      >
                        释放
                      </button>
                      <button
                        className="delete-feeling-btn"
                        onClick={() => deleteFeeling(event.id, feeling.id)}
                        title="删除感受"
                      >
                        删除
                      </button>
                    </div>
                  ) : (
                    <div className="feeling-actions">
                      <span className="completed-badge">已释放</span>
                      <button
                        className="delete-feeling-btn"
                        onClick={() => deleteFeeling(event.id, feeling.id)}
                        title="删除感受"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {event.feelings.length > 0 && (
              <div className="event-status" onClick={() => toggleEventCompleted(event.id)}>
                {event.completed ? (
                  <span className="all-done">所有感受已释放 ✓ (点击切换)</span>
                ) : (
                  <span className="pending">
                    {event.feelings.filter(f => f.feelingGood).length}/{event.feelings.length} 感受已释放 (点击切换)
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="add-event-btn" onClick={addEvent}>
          + 添加新事件
        </button>
        <button className="next-btn" onClick={goToNextExercise}>
          {currentExerciseIndex < practice.exercises.length - 1
            ? '下一个子练习 →'
            : practice.attemptsMade < practice.attemptsRequired
            ? '完成本次，开始下一次 →'
            : '完成练习 ✓'}
        </button>
      </div>

      {renderReleaseFlow()}
    </div>
  );
}