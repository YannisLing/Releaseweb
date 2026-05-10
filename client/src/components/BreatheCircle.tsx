import { useState, useEffect, useRef } from 'react'
import './BreatheCircle.css'

export default function BreatheCircle() {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale')
  const [key, setKey] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    let currentPhase = 0
    const phases: ('inhale' | 'exhale')[] = ['inhale', 'exhale']

    intervalRef.current = window.setInterval(() => {
      currentPhase = (currentPhase + 1) % 2
      setPhase(phases[currentPhase])
      setKey(k => k + 1)
    }, 4300)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="breathe-circle-container">
      <div key={key} className={`breathe-circle ${phase}`}>
        <span className="breathe-text">
          {phase === 'inhale' ? '吸气...' : '呼气...'}
        </span>
      </div>
    </div>
  )
}