import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import BreatheCircle from '../components/BreatheCircle'
import { practiceModes, getModeById, type PracticeMode } from '../data/practiceModes'
import './PracticePage.css'

export default function PracticePage() {
  const navigate = useNavigate()
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [intensity, setIntensity] = useState(5)
  const [note, setNote] = useState('')
  const [showModeSelection, setShowModeSelection] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('selectedEmotions')
    if (saved) {
      setSelectedEmotions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (practiceMode) {
      const mode = getModeById(practiceMode)
      const newProgress = ((currentStep - 1) / (mode.steps.length + 1)) * 100
      setProgress(newProgress)
    }
  }, [currentStep, practiceMode])

  const selectMode = (mode: PracticeMode) => {
    setPracticeMode(mode)
    setShowModeSelection(false)
    setCurrentStep(1)
  }

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const resetPractice = () => {
    setCurrentStep(1)
    setIntensity(5)
    setNote('')
  }

  const handleSaveRecord = async () => {
    if (selectedEmotions.length === 0) {
      alert('请先选择要释放的情绪！')
      return
    }

    try {
      await api.saveRecord({
        emotions: selectedEmotions,
        intensity,
        note
      })

      localStorage.removeItem('selectedEmotions')
      setSelectedEmotions([])
      resetPractice()
      navigate('/records')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  const handleBackToModes = () => {
    setShowModeSelection(true)
    setPracticeMode(null)
    setCurrentStep(1)
    resetPractice()
  }

  const renderModeSelection = () => {
    const modes = Object.values(practiceModes)

    return (
      <div className="mode-selection">
        <h2>选择练习模式</h2>
        <p className="mode-intro">根据92年圣多娜原始释放法教程，我们提供以下几种练习模式</p>

        <div className="mode-grid">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="mode-card"
              onClick={() => selectMode(mode.id)}
            >
              <div className="mode-emoji">{mode.emoji}</div>
              <h3>{mode.name}</h3>
              <p>{mode.description}</p>
              <div className="mode-steps-count">{mode.steps.length} 个步骤</div>
            </div>
          ))}
        </div>

        <div className="emotion-selection-hint">
          <p>💡 提示：在开始练习前，建议先在「情绪表」页面选择你想要释放的情绪</p>
          <button className="btn btn-secondary" onClick={() => navigate('/emotions')}>
            ← 去选择情绪
          </button>
        </div>
      </div>
    )
  }

  const renderPracticeStep = () => {
    if (!practiceMode) return null

    const mode = getModeById(practiceMode)
    const stepIndex = currentStep - 1
    const step = mode.steps[stepIndex]

    if (currentStep > mode.steps.length) {
      return (
        <div className="step-content">
          <h2>释放完成</h2>
          <div className="completion-message">
            <div className="celebration">🕊️✨🌈</div>
            <h2>做得好！</h2>
            <p>你刚刚完成了一次「{mode.name}」练习。</p>
            <p>继续感受，还有没有其他感觉浮现？如果有，继续释放。</p>
            <p className="quote">"记住，无论什么感觉，它都是一个感觉，可以抓着，可以放手，选择权永远在自己手中。"</p>
          </div>
          <div className="selected-emotions-box">
            <h4>本次释放的情绪：</h4>
            <div className="selected-tags">
              {selectedEmotions.length > 0 ? (
                selectedEmotions.map((emotion, index) => (
                  <span key={index} className="selected-tag">{emotion}</span>
                ))
              ) : (
                <span className="placeholder-text">未选择特定情绪</span>
              )}
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={handleBackToModes}>
              选择其他模式
            </button>
            <button className="btn btn-secondary" onClick={resetPractice}>
              再次练习
            </button>
            <button className="btn btn-primary" onClick={handleSaveRecord}>
              保存记录
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="step-content">
        <h2>{step.title}</h2>
        <div className="intro-box">
          <p>{step.instruction}</p>
        </div>
        {step.question && (
          <div className="question-box">
            <p className="question-text">"{step.question}"</p>
          </div>
        )}
        {step.options && (
          <div className="options-box">
            {step.options.map((option, index) => (
              <button
                key={index}
                className="btn btn-option"
                onClick={() => goToStep(currentStep + 1)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {stepIndex === mode.steps.length - 1 && practiceMode === 'basic' && (
          <BreatheCircle />
        )}
        {stepIndex === mode.steps.length - 1 && practiceMode !== 'basic' && (
          <BreatheCircle />
        )}
        <div className="btn-group">
          {currentStep > 1 ? (
            <button className="btn btn-secondary" onClick={() => goToStep(currentStep - 1)}>
              ← 上一步
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handleBackToModes}>
              返回模式选择
            </button>
          )}
          {!step.options && (
            <button className="btn btn-primary" onClick={() => goToStep(currentStep + 1)}>
              继续 →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (showModeSelection) {
    return (
      <div className="content">
        {renderModeSelection()}
      </div>
    )
  }

  const mode = practiceMode ? getModeById(practiceMode) : null

  return (
    <div className="content">
      <div className="practice-header">
        <div className="practice-mode-badge">
          {mode?.emoji} {mode?.name}
        </div>
        <button className="btn-change-mode" onClick={handleBackToModes}>
          切换模式
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="step-indicator">
        {[...Array(mode ? mode.steps.length + 1 : 1)].map((_, index) => (
          <div
            key={index}
            className={`step-dot ${
              index + 1 === currentStep ? 'active' :
              index + 1 < currentStep ? 'completed' : ''
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {renderPracticeStep()}
    </div>
  )
}