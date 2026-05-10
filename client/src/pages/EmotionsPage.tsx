import { useState, useEffect } from 'react'
import { emotionCategories } from '../data/emotions'
import BreatheCircle from '../components/BreatheCircle'
import './EmotionsPage.css'
import './PracticeDetailPage.css'

export default function EmotionsPage() {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [releaseState, setReleaseState] = useState<{
    active: boolean
    feelingName: string
    step: number
  }>({
    active: false,
    feelingName: '',
    step: 0
  })

  useEffect(() => {
    const saved = localStorage.getItem('selectedEmotions')
    if (saved) {
      setSelectedEmotions(JSON.parse(saved))
    }
  }, [])

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      const newEmotions = prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]

      localStorage.setItem('selectedEmotions', JSON.stringify(newEmotions))
      return newEmotions
    })
  }

  const removeEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      const newEmotions = prev.filter(e => e !== emotion)
      localStorage.setItem('selectedEmotions', JSON.stringify(newEmotions))
      return newEmotions
    })
  }

  const startRelease = (emotion: string) => {
    setReleaseState({
      active: true,
      feelingName: emotion,
      step: 0
    })
  }

  const nextReleaseStep = () => {
    setReleaseState(prev => ({
      ...prev,
      step: prev.step + 1
    }))
  }

  const cancelRelease = () => {
    setReleaseState({
      active: false,
      feelingName: '',
      step: 0
    })
  }

  const completeRelease = () => {
    setSelectedEmotions(prev => {
      const newEmotions = prev.filter(e => e !== releaseState.feelingName)
      localStorage.setItem('selectedEmotions', JSON.stringify(newEmotions))
      return newEmotions
    })
    cancelRelease()
  }

  const steps = [
    { question: '感受这个情绪' },
    { question: '你能让这种感觉离开吗？' },
    { question: '如果能，你愿意让它离开吗？' },
    { question: '你什么时候让它离开呢？' },
    { question: '这种感受还在吗？' }
  ]

  const renderReleaseFlow = () => {
    if (!releaseState.active) return null

    const currentStepData = steps[releaseState.step]

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
            <div className="step-number">步骤 {releaseState.step + 1}/{steps.length}</div>
            <div className="release-question">{currentStepData.question}</div>

            <BreatheCircle />

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
                <button className="btn btn-outline" onClick={() => setReleaseState(prev => ({ ...prev, step: 0 }))}>
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
    )
  }

  return (
    <div className="content emotions-page">
      <h2 className="page-title">圣多娜情绪表（完整版）</h2>
      <p className="page-subtitle">
        点击任意情绪进入释放流程<br />
        <small>关键词可以帮助你快速定位情绪类别</small>
      </p>

      <div className="selected-emotions-box">
        <h4>已选择的情绪（点击直接释放）：</h4>
        <div className="selected-tags">
          {selectedEmotions.length > 0 ? (
            selectedEmotions.map((emotion, index) => (
              <span key={index} className="selected-tag release-ready" onClick={() => startRelease(emotion)}>
                {emotion}
                <span className="remove" onClick={(e) => { e.stopPropagation(); removeEmotion(emotion); }}>&times;</span>
              </span>
            ))
          ) : (
            <span className="placeholder-text">点击下方情绪标签进行选择</span>
          )}
        </div>
      </div>

      <div className="emotion-grid">
        {emotionCategories.map(category => (
          <div key={category.id} className={`emotion-category ${category.id}`}>
            <h3 style={{ borderColor: category.color, color: category.color }}>
              {category.emoji} {category.name}
            </h3>
            <div className="emotion-list">
              {category.emotions.map((emotion, index) => (
                <span
                  key={index}
                  className={`emotion-tag ${selectedEmotions.includes(emotion) ? 'selected' : ''}`}
                  onClick={() => {
                    toggleEmotion(emotion)
                    if (!selectedEmotions.includes(emotion)) {
                      setTimeout(() => startRelease(emotion), 100)
                    }
                  }}
                >
                  {emotion}
                </span>
              ))}
            </div>
            <div className="keyword-hint">
              💡 关键词：{category.keywords}
            </div>
          </div>
        ))}
      </div>

      {renderReleaseFlow()}
    </div>
  )
}