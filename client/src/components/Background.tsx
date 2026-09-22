import { useEffect, useRef } from 'react'
import { emotionCategories } from '../data/emotions'

/**
 * 全局背景：
 * 1. aurora 光晕（3 个柔焦色块漂浮）
 * 2. canvas 漂浮情绪词粒子（颜色跟随 --accent）
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    // 收集所有情绪词作为粒子池
    const pool: string[] = []
    emotionCategories.forEach(c => c.emotions.forEach(w => pool.push(w)))
    if (pool.length === 0) pool.push('释放', '平和', '接纳', '无畏')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0

    interface P {
      x: number
      y: number
      vx: number
      vy: number
      s: number
      a: number
      w: string
    }

    const parts: P[] = []
    const count = window.innerWidth < 700 ? 14 : 26

    function spawn(p?: P): P {
      const np = p || ({} as P)
      np.x = Math.random() * W
      np.y = H + 40 * Math.random() + 20
      np.vy = -(0.18 + Math.random() * 0.4) * dpr
      np.vx = (Math.random() - 0.5) * 0.14 * dpr
      np.s = (11 + Math.random() * 10) * dpr
      np.a = 0.05 + Math.random() * 0.13
      np.w = pool[Math.floor(Math.random() * pool.length)] || ''
      return np
    }

    function resize() {
      W = cv!.width = window.innerWidth * dpr
      H = cv!.height = window.innerHeight * dpr
      cv!.style.width = window.innerWidth + 'px'
      cv!.style.height = window.innerHeight + 'px'
    }

    resize()

    for (let i = 0; i < count; i++) {
      const p = spawn()
      p.y = Math.random() * H
      parts.push(p)
    }

    function hex2rgb(h: string): [number, number, number] {
      const n = parseInt(h.slice(1), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    function accentRGB(): [number, number, number] {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()
      return v.startsWith('#') ? hex2rgb(v) : [154, 163, 178]
    }

    let raf = 0
    const loop = () => {
      ctx!.clearRect(0, 0, W, H)
      const [r, g, b] = accentRGB()
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -40 || p.x < -60 || p.x > W + 60) {
          spawn(p)
          p.w = pool[Math.floor(Math.random() * pool.length)] || p.w
        }
        ctx!.font = `${p.s}px KaiTi, STKaiti, serif`
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.a})`
        ctx!.fillText(p.w, p.x, p.y)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <div className="aurora">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>
      <canvas id="bg-canvas" ref={canvasRef}></canvas>
    </>
  )
}
