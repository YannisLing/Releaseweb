import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_PRACTICES, type Practice, type Exercise, type Event, type Feeling } from '../data/workbookPractices';
import { emotionCategories } from '../data/emotions';
import { api } from '../services/api';
import { usePractice } from '../context/PracticeContext';
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
  const { updatePracticeProgress } = usePractice();
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
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWant, setSelectedWant] = useState<string | null>(null);
  const emotionSlidesRef = useRef<HTMLDivElement | null>(null);
  const categoryIndexRef = useRef<HTMLDivElement | null>(null);
  const [indexThumb, setIndexThumb] = useState({ width: 100, left: 0 });
  const indexDraggingRef = useRef<{ startX: number; startLeft: number } | null>(null);
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const eventsScrollRef = useRef<HTMLDivElement | null>(null);
  const prevEventsLenRef = useRef(0);
  const [descExpanded, setDescExpanded] = useState(false);

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

  // 切换练习项时重置事件索引和描述折叠
  useEffect(() => {
    setActiveEventIdx(0);
    prevEventsLenRef.current = 0;
    setDescExpanded(false);
  }, [currentExerciseIndex]);

  // 新增事件后自动滚动到最后一张
  useEffect(() => {
    const len = currentExercise?.events.length ?? 0;
    if (len > prevEventsLenRef.current && len > 0) {
      setTimeout(() => scrollToEvent(len - 1), 80);
    }
    prevEventsLenRef.current = len;
  }, [currentExercise?.events.length]);

  const handleEventsScroll = () => {
    const el = eventsScrollRef.current;
    if (!el || el.children.length === 0) return;
    const slideWidth = el.scrollWidth / el.children.length;
    if (slideWidth <= 0) return;
    const idx = Math.round(el.scrollLeft / slideWidth);
    if (idx !== activeEventIdx && idx >= 0) {
      setActiveEventIdx(idx);
    }
  };

  const scrollToEvent = (idx: number) => {
    const el = eventsScrollRef.current;
    if (!el || el.children.length === 0) return;
    const slideWidth = el.scrollWidth / el.children.length;
    if (slideWidth <= 0) return;
    el.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
    setActiveEventIdx(idx);
  };

  const goPrevEvent = () => scrollToEvent(Math.max(0, activeEventIdx - 1));
  const goNextEvent = () => {
    const max = (currentExercise?.events.length ?? 1) - 1;
    scrollToEvent(Math.min(max, activeEventIdx + 1));
  };

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

      updatePracticeProgress(practice.id, {
        practiceId: practice.id,
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

  const handleEmotionSlidesScroll = () => {
    const el = emotionSlidesRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== activeCategoryIdx && idx >= 0 && idx < emotionCategories.length) {
      setActiveCategoryIdx(idx)
    }
  }

  const scrollToCategory = (idx: number) => {
    const el = emotionSlidesRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setActiveCategoryIdx(idx)
  }

  // 桌面端：滚轮转横向滑动
  const handleSlidesWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = emotionSlidesRef.current
    if (!el) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY
    }
  }

  // 桌面端：鼠标拖拽滑动
  const dragStateRef = useRef<{ startX: number; startLeft: number; dragging: boolean } | null>(null)

  const handleSlidesMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = emotionSlidesRef.current
    if (!el) return
    dragStateRef.current = { startX: e.clientX, startLeft: el.scrollLeft, dragging: true }
    el.style.cursor = 'grabbing'
  }

  const handleSlidesMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const st = dragStateRef.current
    const el = emotionSlidesRef.current
    if (!st || !st.dragging || !el) return
    const dx = e.clientX - st.startX
    el.scrollLeft = st.startLeft - dx
  }

  const handleSlidesMouseUp = () => {
    const el = emotionSlidesRef.current
    const st = dragStateRef.current
    if (el) el.style.cursor = ''
    if (st) {
      st.dragging = false
      dragStateRef.current = null
    }
  }

  const goPrevCategory = () => {
    const i = Math.max(0, activeCategoryIdx - 1)
    scrollToCategory(i)
  }
  const goNextCategory = () => {
    const i = Math.min(emotionCategories.length - 1, activeCategoryIdx + 1)
    scrollToCategory(i)
  }

  // 索引滚动条同步
  const updateIndexThumb = () => {
    const el = categoryIndexRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) {
      setIndexThumb({ width: 100, left: 0 })
      return
    }
    const thumbWidth = (el.clientWidth / el.scrollWidth) * 100
    const thumbLeft = (el.scrollLeft / maxScroll) * (100 - thumbWidth)
    setIndexThumb({ width: thumbWidth, left: thumbLeft })
  }

  const handleIndexScroll = () => {
    updateIndexThumb()
  }

  // 索引滚动条拖拽
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = categoryIndexRef.current
    if (!el) return
    indexDraggingRef.current = { startX: e.clientX, startLeft: el.scrollLeft }

    const onMove = (ev: MouseEvent) => {
      const drag = indexDraggingRef.current
      const idxEl = categoryIndexRef.current
      if (!drag || !idxEl) return
      const trackEl = idxEl.parentElement?.querySelector('.category-scroll-indicator') as HTMLElement
      if (!trackEl) return
      const trackWidth = trackEl.clientWidth
      const maxScroll = idxEl.scrollWidth - idxEl.clientWidth
      const dx = ev.clientX - drag.startX
      idxEl.scrollLeft = drag.startLeft + (dx / trackWidth) * maxScroll
    }
    const onUp = () => {
      indexDraggingRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    e.preventDefault()
  }

  // 面板打开时初始化滚动条
  useEffect(() => {
    if (showEmotionPicker) {
      setTimeout(updateIndexThumb, 50)
    }
  }, [showEmotionPicker])

  const renderEmotionPicker = (eventId: string) => {
    if (showEmotionPicker !== eventId) return null

    const eventForPicker = currentExercise?.events.find(e => e.id === eventId)

    return (
      <div className="emotion-picker-modal" onClick={() => setShowEmotionPicker(null)}>
        <div className="emotion-picker" onClick={e => e.stopPropagation()}>
          <div className="emotion-picker-header">
            <div className="picker-title-group">
              <h3>选择感受</h3>
              {eventForPicker && (
                <span className="picker-event-name">
                  {eventForPicker.situation || '未命名事件'}
                </span>
              )}
            </div>
            <button className="close-picker-icon" onClick={() => setShowEmotionPicker(null)}>✕</button>
          </div>

          {/* 顶部索引条 - 横向滚动 */}
          <div className="emotion-category-index" ref={categoryIndexRef} onScroll={handleIndexScroll}>
            {emotionCategories.map((cat, i) => (
              <button
                key={cat.id}
                className={`category-tab ${i === activeCategoryIdx ? 'active' : ''}`}
                style={{ ['--cat-color' as any]: cat.color }}
                onClick={() => scrollToCategory(i)}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 可拖动滚动条 */}
          <div className="category-scroll-indicator">
            <div
              className="category-scroll-thumb"
              style={{ width: `${indexThumb.width}%`, left: `${indexThumb.left}%` }}
              onMouseDown={handleThumbMouseDown}
            />
          </div>

          {/* 分类内容 - 横向滑动，每页一个分类 */}
          <div className="emotion-category-stage">
            <button
              className="slide-nav-btn slide-nav-prev"
              onClick={goPrevCategory}
              disabled={activeCategoryIdx === 0}
              aria-label="上一类"
            >‹</button>
            <div
              className="emotion-category-slides"
              ref={emotionSlidesRef}
              onScroll={handleEmotionSlidesScroll}
              onWheel={handleSlidesWheel}
              onMouseDown={handleSlidesMouseDown}
              onMouseMove={handleSlidesMouseMove}
              onMouseUp={handleSlidesMouseUp}
              onMouseLeave={handleSlidesMouseUp}
            >
              {emotionCategories.map(cat => (
                <div key={cat.id} className="emotion-category-slide">
                  <div className="slide-header" style={{ color: cat.color }}>
                    <span className="slide-emoji">{cat.emoji}</span>
                    <span className="slide-name">{cat.name}</span>
                    <span className="slide-count">{cat.emotions.length}</span>
                  </div>
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
            </div>
            <button
              className="slide-nav-btn slide-nav-next"
              onClick={goNextCategory}
              disabled={activeCategoryIdx === emotionCategories.length - 1}
              aria-label="下一类"
            >›</button>
          </div>

          <div className="slide-hint">← 滑动 / 拖拽 / 滚轮切换分类 · 点击感受即添加 →</div>
        </div>
      </div>
    )
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
      {/* 顶部栏 */}
      <header className="pd-header">
        <button className="back-btn" onClick={goBack}>← 返回</button>
        <div className="practice-info">
          <h1>{practice.name}</h1>
          <div className="practice-meta">
            <span className="pages">{practice.pages}</span>
            <span className="attempt">第 {currentAttempt}/{practice.attemptsRequired} 次</span>
          </div>
        </div>
      </header>

      {/* 主体：桌面两栏，移动单列 */}
      <div className="pd-main">
        {/* 左栏：练习项导航 + 描述 + 操作 */}
        <aside className="pd-sidebar">
          {/* 移动端：横向 tab；桌面端：垂直列表 */}
          <nav className="pd-exercise-nav">
            {practice.exercises.map((ex, i) => (
              <button
                key={ex.id}
                className={`pd-exercise-item ${i === currentExerciseIndex ? 'active' : ''}`}
                onClick={() => setCurrentExerciseIndex(i)}
              >
                <span className="pd-exercise-num">{i + 1}</span>
                <span className="pd-exercise-name">{ex.name}</span>
              </button>
            ))}
          </nav>

          <div className={`pd-description ${descExpanded ? 'expanded' : 'collapsed'}`}>
            <button
              className="pd-desc-toggle"
              onClick={() => setDescExpanded(v => !v)}
            >
              <span className="pd-desc-label">练习说明</span>
              <span className="pd-desc-arrow">{descExpanded ? '▾' : '▸'}</span>
            </button>
            {descExpanded && <p>{currentExercise.description}</p>}
          </div>

          <div className="pd-actions">
            <button className="add-event-btn" onClick={addEvent}>
              + 添加新事件
            </button>
            <button className="next-btn" onClick={goToNextExercise}>
              {currentExerciseIndex < practice.exercises.length - 1
                ? '下一个子练习 →'
                : practice.attemptsMade < practice.attemptsRequired
                ? '完成本次 →'
                : '完成练习 ✓'}
            </button>
          </div>
        </aside>

        {/* 右栏：事件卡片轮播 */}
        <section className="pd-events">
          <div className="pd-events-bar">
            <button
              className="pd-arrow"
              onClick={goPrevEvent}
              disabled={activeEventIdx === 0 || currentExercise.events.length === 0}
            >‹</button>
            <span className="pd-events-count">
              {currentExercise.events.length > 0
                ? `事件 ${activeEventIdx + 1} / ${currentExercise.events.length}`
                : '暂无事件'}
            </span>
            <button
              className="pd-arrow"
              onClick={goNextEvent}
              disabled={activeEventIdx >= currentExercise.events.length - 1 || currentExercise.events.length === 0}
            >›</button>
          </div>

          <div
            className="pd-events-track"
            ref={eventsScrollRef}
            onScroll={handleEventsScroll}
          >
            {currentExercise.events.length === 0 ? (
              <div className="pd-empty">
                <div className="pd-empty-icon">📝</div>
                <p className="pd-empty-title">还没有事件</p>
                <p className="pd-empty-hint">点击「+ 添加新事件」开始记录</p>
              </div>
            ) : (
              currentExercise.events.map((event, idx) => (
                <div key={event.id} className={`pd-event-card ${event.completed ? 'completed' : ''}`}>
                  <div className="pd-event-top">
                    <span className="pd-event-tag">事件 {idx + 1}</span>
                    <button
                      className="delete-event-btn"
                      onClick={() => deleteEvent(event.id)}
                    >删除</button>
                  </div>

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
                    placeholder="输入事件描述..."
                    className="pd-event-input"
                  />

                  <div className="pd-feelings-head">
                    <span className="pd-feelings-title">
                      感受 <b>{event.feelings.length}</b>
                    </span>
                    <button
                      className="add-feeling-btn"
                      onClick={() => {
                        setActiveCategoryIdx(0);
                        emotionSlidesRef.current?.scrollTo({ left: 0 });
                        setShowEmotionPicker(event.id);
                      }}
                    >+ 添加感受</button>
                  </div>

                  <div className="pd-feelings">
                    {event.feelings.length === 0 ? (
                      <p className="pd-no-feelings">还没有感受，点击上方添加</p>
                    ) : (
                      event.feelings.map(feeling => (
                        <div key={feeling.id} className={`pd-feeling ${feeling.feelingGood ? 'released' : ''}`}>
                          <span className="pd-feeling-name">
                            {feeling.feelingGood ? '✓ ' : ''}{feeling.name}
                          </span>
                          <div className="pd-feeling-actions">
                            {!feeling.released ? (
                              <button
                                className="release-btn"
                                onClick={() => startRelease(event.id, feeling)}
                              >释放</button>
                            ) : (
                              <span className="completed-badge">已释放</span>
                            )}
                            <button
                              className="delete-feeling-btn"
                              onClick={() => deleteFeeling(event.id, feeling.id)}
                            >删除</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {event.feelings.length > 0 && (
                    <div className="pd-event-status" onClick={() => toggleEventCompleted(event.id)}>
                      {event.completed ? (
                        <span className="all-done">✓ 全部释放（点击切换）</span>
                      ) : (
                        <span className="pending">
                          {event.feelings.filter(f => f.feelingGood).length}/{event.feelings.length} 已释放（点击切换）
                        </span>
                      )}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 情绪选择浮动面板（从页面根级别渲染，避免被卡片 overflow/backdrop-filter 困住） */}
      {showEmotionPicker && renderEmotionPicker(showEmotionPicker)}

      {renderReleaseFlow()}
    </div>
  );
}
