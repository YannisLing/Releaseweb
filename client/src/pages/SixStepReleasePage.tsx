import { useState } from 'react'
import './SixStepReleasePage.css'

export default function SixStepReleasePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [feelingName, setFeelingName] = useState('')
  const [isReleasing, setIsReleasing] = useState(false)

  const sixSteps = [
    {
      step: 1,
      question: '想要不受限制的自由(让感觉更好一点/达到波澜不惊的状态)超过想要其它的一切',
      instruction: 'Deeply desire freedom from limitations more than anything else.'
    },
    {
      step: 2,
      question: '让自己通过这个方法获得无拘无束，轻松自在',
      instruction: 'Decide that you can do this method and be free.'
    },
    {
      step: 3,
      question: '看到您所有的感受都是三大基本欲望的表现形式',
      instruction: '释放想要被认同/被爱、想要控制、直到最后放下对死亡的恐惧。',
      subWants: ['想要认同/被爱', '想要控制', '想要安全/生存']
    },
    {
      step: 4,
      question: '随时随地、持续不断地释放',
      instruction: 'Release continuously, wherever you are, whenever you can.'
    },
    {
      step: 5,
      question: '如果您觉得被困住了，放下想要改变困境的欲望',
      instruction: 'If you feel stuck, let go of the wanting to change the stuckness.'
    },
    {
      step: 6,
      question: '随着您释放得越来越多，您变得更轻松愉快',
      instruction: 'Release more and more until you move beyond happiness into imperturbability and freedom.'
    }
  ]

  const [selectedWant, setSelectedWant] = useState<string | null>(null)

  const startRelease = () => {
    if (!feelingName.trim()) {
      alert('请先输入你想释放的感受')
      return
    }
    setIsReleasing(true)
    setCurrentStep(0)
    setSelectedWant(null)
  }

  const nextStep = () => {
    if (currentStep < sixSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const finishRelease = () => {
    setIsReleasing(false)
    setCurrentStep(0)
    setFeelingName('')
    setSelectedWant(null)
  }

  const reset = () => {
    setIsReleasing(false)
    setCurrentStep(0)
    setSelectedWant(null)
  }

  return (
    <div className="six-step-page">
      <div className="page-header">
        <h1>✨ 释放法黄金六步骤</h1>
        <p className="page-subtitle">莱斯特释放法的核心精髓</p>
      </div>

      {!isReleasing ? (
        <div className="start-section">
          <div className="feeling-input-box">
            <label>你想释放什么感受？</label>
            <input
              type="text"
              className="feeling-input"
              value={feelingName}
              onChange={(e) => setFeelingName(e.target.value)}
              placeholder="例如：焦虑、愤怒、恐惧..."
            />
          </div>

          <button className="start-btn" onClick={startRelease}>
            开始释放
          </button>

          <div className="steps-intro">
            <h3>黄金六步骤简介</h3>
            <div className="steps-list">
              {sixSteps.map((step, i) => (
                <div key={i} className="step-intro-item">
                  <span className="step-number-badge">{step.step}</span>
                  <span className="step-intro-text">{step.question}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="release-section">
          <div className="release-header">
            <div className="release-feeling-name">
              释放: {feelingName}
            </div>
            <button className="close-release-btn" onClick={reset}>✕</button>
          </div>

          <div className="release-progress-dots">
            {sixSteps.map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${currentStep >= i ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                onClick={() => setCurrentStep(i)}
              />
            ))}
          </div>

          <div className="release-step-content">
            <div className="step-display">
              <span className="step-number">步骤 {currentStep + 1}/6</span>
              <h2 className="step-question">{sixSteps[currentStep].question}</h2>
              <p className="step-instruction">{sixSteps[currentStep].instruction}</p>

              {currentStep === 2 && (
                <div className="three-wants-section">
                  <p className="wants-intro">选择你想要释放的欲望：</p>
                  <div className="wants-buttons">
                    {(sixSteps[currentStep].subWants || []).map((want, i) => (
                      <button
                        key={i}
                        className={`want-btn ${selectedWant === want ? 'selected' : ''}`}
                        onClick={() => setSelectedWant(want)}
                      >
                        {want}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button
                className="btn-secondary"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                ← 上一步
              </button>

              {currentStep < 5 ? (
                <button className="btn-primary" onClick={nextStep}>
                  下一步 →
                </button>
              ) : (
                <button className="btn-success" onClick={finishRelease}>
                  完成释放 ✓
                </button>
              )}
            </div>

            {currentStep === 5 && (
              <button className="btn-link" onClick={() => setCurrentStep(0)}>
                重新开始六步骤
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}