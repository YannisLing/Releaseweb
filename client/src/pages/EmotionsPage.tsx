import { useState, useRef, useEffect, useCallback } from 'react'
import { emotionCategories } from '../data/emotions'
import BreatheCircle from '../components/BreatheCircle'
import './EmotionsPage.css'

// 桌面端 stage 布局所需的英文名 + 描述
const CATEGORY_META: Record<string, { en: string; desc: string }> = {
  wannianjuhui: { en: 'APATHY', desc: '能量近乎冻结的状态——觉得被困住、无望而麻木，连挣扎的力气都被抽空。' },
  beiku: { en: 'GRIEF', desc: '心随失去而碎——哀伤、思念与泪水汇成河流，渴望一份已经不在的温暖。' },
  kongju: { en: 'FEAR', desc: '对未知与危险的警觉——紧绷、不安、想逃，把自己缩进一个小小的壳里。' },
  tanqiu: { en: 'GREED', desc: '总觉得还不够——渴望抓取更多、更远、更快，却始终填不满内心的洞。' },
  fennu: { en: 'ANGER', desc: '能量开始上升——火花迸发，想反击、想改变，愤怒之下往往藏着未被看见的痛。' },
  zirenzihao: { en: 'PRIDE', desc: '用优越感筑起高墙——把自己抬高的同时，也把真实的感受挡在了门外。' },
  wuwei: { en: 'COURAGE', desc: '能量开始流动——敢于面对、敢于行动，恐惧仍在却不再被它支配。' },
  jieda: { en: 'ACCEPTANCE', desc: '放下对抗的双手——允许一切如其所是，与自己、与世界和解。' },
  pinghe: { en: 'PEACE', desc: '涟漪归静——无求无惧，安住当下，存在的本身就是圆满。' },
  sandaXiangyao: { en: 'THREE WANTS', desc: '所有情绪的底层动力——想要认同、想要控制、想要安全，看见即释放的开始。' },
}

export default function EmotionsPage() {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0)
  const [markedEmotions, setMarkedEmotions] = useState<Set<string>>(new Set())
  const [releaseState, setReleaseState] = useState<{
    active: boolean
    feelingName: string
    step: number
  }>({
    active: false,
    feelingName: '',
    step: 0
  })
  const emotionGridRef = useRef<HTMLDivElement | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const longPressFiredRef = useRef(false)

  // 加载持久化标记
  useEffect(() => {
    const saved = localStorage.getItem('markedEmotions')
    if (saved) {
      try { setMarkedEmotions(new Set(JSON.parse(saved))) } catch { /* ignore */ }
    }
  }, [])

  const toggleMark = useCallback((emotion: string) => {
    setMarkedEmotions(prev => {
      const next = new Set(prev)
      if (next.has(emotion)) next.delete(emotion)
      else next.add(emotion)
      localStorage.setItem('markedEmotions', JSON.stringify([...next]))
      return next
    })
  }, [])

  // 长按 + 单击处理
  const handleTagStart = (emotion: string) => {
    longPressFiredRef.current = false
    longPressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true
      startRelease(emotion)
    }, 500)
  }

  const handleTagEnd = (emotion: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (!longPressFiredRef.current) {
      toggleMark(emotion)
    }
  }

  const handleTagLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const startRelease = (emotion: string) => {
    setReleaseState({ active: true, feelingName: emotion, step: 0 })
  }
  const nextReleaseStep = () => setReleaseState(prev => ({ ...prev, step: prev.step + 1 }))
  const cancelRelease = () => setReleaseState({ active: false, feelingName: '', step: 0 })
  const completeRelease = () => cancelRelease()

  const steps = [
    { question: '感受这个情绪' },
    { question: '你能让这种感觉离开吗？' },
    { question: '如果能，你愿意让它离开吗？' },
    { question: '你什么时候让它离开呢？' },
    { question: '这种感受还在吗？' }
  ]

  const syncMobileSlide = (idx: number) => {
    const el = emotionGridRef.current
    if (!el || !el.children.length) return
    const slideWidth = el.scrollWidth / emotionCategories.length
    if (slideWidth > 0) el.scrollTo({ left: idx * slideWidth, behavior: 'smooth' })
  }

  const handleGridScroll = () => {
    const el = emotionGridRef.current
    if (!el || el.children.length === 0) return
    const slideWidth = el.scrollWidth / emotionCategories.length
    if (slideWidth <= 0) return
    const idx = Math.round(el.scrollLeft / slideWidth)
    if (idx !== activeCategoryIdx && idx >= 0 && idx < emotionCategories.length) {
      setActiveCategoryIdx(idx)
    }
  }

  const selectCategory = (idx: number) => {
    setActiveCategoryIdx(idx)
    syncMobileSlide(idx)
  }

  const active = emotionCategories[activeCategoryIdx]
  const meta = CATEGORY_META[active.id] || { en: '', desc: '' }

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
                <button className="btn btn-secondary" onClick={cancelRelease}>取消</button>
                <button className="btn btn-primary" onClick={nextReleaseStep}>继续 →</button>
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

  // 根据词长分大小档
  const tagSize = (w: string) => {
    const len = [...w].length
    if (len <= 3) return 's1'
    if (len <= 5) return 's2'
    return 's3'
  }

  return (
    <div className="content emotions-page">
      {/* 页面头部 */}
      <header className="emo-head">
        <span className="emo-eyebrow">情 绪 觉 察</span>
        <h1 className="emo-title">APFLG情绪表</h1>
        <p className="emo-subtitle">从 万 念 俱 灰 ， 走 向 释 放</p>
      </header>

      {/* 频谱索引：桌面端点+轨道，移动端胶囊 tab */}
      <nav className="emotion-spectrum">
        <div className="spectrum-track"></div>
        <div
          className="spectrum-track-fill"
          style={{ width: `${(activeCategoryIdx / emotionCategories.length) * 100}%` }}
        ></div>
        <div className="spectrum-nodes">
          {emotionCategories.map((cat, i) => (
            <button
              key={cat.id}
              className={`spectrum-node ${i === activeCategoryIdx ? 'active' : ''}`}
              style={{ ['--cat-color' as any]: cat.color }}
              onClick={() => selectCategory(i)}
            >
              <span className="spectrum-dot"></span>
              <span className="spectrum-label">{cat.name}</span>
              <span className="spectrum-num">0{i + 1}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 桌面端 stage：左侧 level-head + 右侧情绪云 */}
      <main className="emo-stage">
        <aside className="level-head" style={{ ['--cat-color' as any]: active.color }}>
          <div className="level-idx">
            {String(activeCategoryIdx + 1).padStart(2, '0')} — {String(emotionCategories.length).padStart(2, '0')}
          </div>
          <h2 className="level-name" key={active.id}>
            {active.emoji} {active.name}
          </h2>
          <div className="level-en">{meta.en}</div>
          <div className="level-rule"></div>
          <p className="level-desc">{meta.desc}</p>
          <div className="level-meta">
            <span className="chip">情绪词 <b>{active.emotions.length}</b> 个</span>
          </div>
        </aside>
        <div className="cloud" key={active.id + '-cloud'} style={{ ['--cat-color' as any]: active.color }}>
          {active.emotions.map((emotion, index) => (
            <button
              key={index}
              className={`tag ${tagSize(emotion)} ${markedEmotions.has(emotion) ? 'marked' : ''}`}
              style={{ animationDelay: `${Math.min(index, 24) * 22}ms` }}
              onMouseDown={() => handleTagStart(emotion)}
              onMouseUp={() => handleTagEnd(emotion)}
              onMouseLeave={handleTagLeave}
              onTouchStart={() => handleTagStart(emotion)}
              onTouchEnd={() => handleTagEnd(emotion)}
            >
              {emotion}
            </button>
          ))}
        </div>
      </main>

      {/* 移动端：横向滑动分类（桌面端隐藏） */}
      <div
        className="emotion-slides emo-mobile-only"
        ref={emotionGridRef}
        onScroll={handleGridScroll}
      >
        {emotionCategories.map(category => (
          <div
            key={category.id}
            className={`emotion-category ${category.id}`}
            style={{ ['--cat-color' as any]: category.color }}
          >
            <h3 style={{ borderColor: category.color, color: category.color }}>
              {category.emoji} {category.name}
              <span className="category-count">{category.emotions.length}</span>
            </h3>
            <div className="emotion-list">
              {category.emotions.map((emotion, index) => (
                <span
                  key={index}
                  className={`emotion-tag ${markedEmotions.has(emotion) ? 'marked' : ''}`}
                  onMouseDown={() => handleTagStart(emotion)}
                  onMouseUp={() => handleTagEnd(emotion)}
                  onMouseLeave={handleTagLeave}
                  onTouchStart={() => handleTagStart(emotion)}
                  onTouchEnd={() => handleTagEnd(emotion)}
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {renderReleaseFlow()}
    </div>
  )
}
