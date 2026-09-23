import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../services/api'
import './RecordsPage.css'

interface ReleaseRecord {
  id: number
  feeling_name: string
  intensity: number
  note: string
  created_at: string
}

interface Memo {
  id: string
  title: string
  text: string
  createdAt: string
}

const MEMOS_KEY = 'sedona-memos'
const RECORD_PAGE_SIZE = 18
const MEMO_PAGE_SIZE = 18

export default function RecordsPage() {
  const [tab, setTab] = useState<'records' | 'memos'>('records')
  const [records, setRecords] = useState<ReleaseRecord[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0 })
  const [loading, setLoading] = useState(true)
  const [memos, setMemos] = useState<Memo[]>([])
  const [toast, setToast] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetCountdown, setResetCountdown] = useState(3)
  const [resetting, setResetting] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)

  // 分页
  const [recordPage, setRecordPage] = useState(0)
  const [memoPage, setMemoPage] = useState(0)
  const recordsPagerRef = useRef<HTMLDivElement | null>(null)
  const memosPagerRef = useRef<HTMLDivElement | null>(null)

  // 详情浮层
  const [detailRecord, setDetailRecord] = useState<ReleaseRecord | null>(null)
  const [detailMemo, setDetailMemo] = useState<Memo | null>(null)

  // 备忘录编辑器
  const [showMemoEditor, setShowMemoEditor] = useState(false)
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null)
  const [memoTitle, setMemoTitle] = useState('')
  const [memoText, setMemoText] = useState('')

  const fileInputRecordsRef = useRef<HTMLInputElement | null>(null)
  const fileInputMemosRef = useRef<HTMLInputElement | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2400)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const loadRecords = async () => {
    try {
      const data = await api.getAllRecords()
      setRecords(data.records)
      setStats(data.stats)
    } catch (error) {
      console.error('获取记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
    try {
      const saved = localStorage.getItem(MEMOS_KEY)
      if (saved) setMemos(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const persistMemos = (next: Memo[]) => {
    setMemos(next)
    localStorage.setItem(MEMOS_KEY, JSON.stringify(next))
  }

  const fmtDate = (s: string) => {
    const d = new Date(s && s.includes('T') ? s : (s || '').replace(' ', 'T') + 'Z')
    if (isNaN(d.getTime())) return s
    return d.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const fmtDay = (s: string) => {
    const d = new Date(s && s.includes('T') ? s : (s || '').replace(' ', 'T') + 'Z')
    if (isNaN(d.getTime())) return s
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  /* ---------- 释放记录 ---------- */
  const handleDeleteRecord = async (id: number) => {
    try {
      await api.deleteRecord(id)
      loadRecords()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleClearAll = () => {
    if (confirm('确定要清空所有释放记录吗？此操作不可恢复！')) {
      api.clearAllRecords().then(() => loadRecords())
    }
  }

  const handleExportRecords = () => {
    const exportData = records.map(r => ({
      日期: fmtDate(r.created_at),
      感受: r.feeling_name,
      强度: r.intensity,
      备注: r.note
    }))
    downloadJson(exportData, `sedona-records-${todayStr()}.json`)
    showToast('释放记录已导出')
  }

  const handleImportRecords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const items = Array.isArray(parsed) ? parsed : parsed.records
        if (!Array.isArray(items)) throw new Error('invalid')
        const normalized = items.map((r: any) => ({
          feelingName: r.feelingName || r.feeling_name || r['感受'] || '',
          intensity: Number(r.intensity ?? r['强度'] ?? 5) || 5,
          note: r.note || r['备注'] || '',
          createdAt: r.createdAt || r.created_at || (r['日期'] ? new Date(r['日期']).toISOString() : new Date().toISOString())
        })).filter((r: any) => r.feelingName)
        if (normalized.length === 0) {
          showToast('文件中没有可导入的记录')
        } else {
          await api.importRecords(normalized)
          await loadRecords()
          showToast(`导入成功，新增 ${normalized.length} 条`)
        }
      } catch {
        showToast('导入失败：文件格式不正确')
      }
      if (fileInputRecordsRef.current) fileInputRecordsRef.current.value = ''
    }
    reader.readAsText(file)
  }

  /* ---------- 备忘录 ---------- */
  const openNewMemo = () => {
    setEditingMemoId(null)
    setMemoTitle('')
    setMemoText('')
    setShowMemoEditor(true)
  }

  const openEditMemo = (memo: Memo) => {
    setEditingMemoId(memo.id)
    setMemoTitle(memo.title)
    setMemoText(memo.text)
    setShowMemoEditor(true)
    setDetailMemo(null)
  }

  const saveMemo = () => {
    const title = memoTitle.trim()
    const text = memoText.trim()
    if (!title && !text) {
      showToast('请输入标题或内容')
      return
    }
    if (editingMemoId) {
      persistMemos(memos.map(m => m.id === editingMemoId ? { ...m, title, text } : m))
      showToast('感悟已更新')
    } else {
      const memo: Memo = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title, text,
        createdAt: new Date().toISOString()
      }
      persistMemos([memo, ...memos])
      setMemoPage(0)
      showToast('感悟已保存')
    }
    setShowMemoEditor(false)
  }

  const deleteMemo = (id: string) => {
    persistMemos(memos.filter(m => m.id !== id))
    setDetailMemo(null)
  }

  const handleExportMemos = () => {
    const data = { type: 'sedona-memos', version: 2, exportedAt: new Date().toISOString(), memos }
    downloadJson(data, `sedona-memos-${todayStr()}.json`)
    showToast('备忘录已导出')
  }

  const handleImportMemos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const incoming: any[] = Array.isArray(parsed) ? parsed : parsed.memos
        if (!Array.isArray(incoming)) throw new Error('invalid')
        const valid: Memo[] = incoming
          .filter(m => m && (typeof m.text === 'string' || typeof m.title === 'string'))
          .map(m => ({
            id: m.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
            title: m.title || '',
            text: m.text || '',
            createdAt: m.createdAt || new Date().toISOString()
          }))
        const existingIds = new Set(memos.map(m => m.id))
        const fresh = valid.filter(m => !existingIds.has(m.id))
        const merged = [...fresh, ...memos]
        merged.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        persistMemos(merged)
        setMemoPage(0)
        showToast(`导入成功，新增 ${fresh.length} 条`)
      } catch {
        showToast('导入失败：文件格式不正确')
      }
      if (fileInputMemosRef.current) fileInputMemosRef.current.value = ''
    }
    reader.readAsText(file)
  }

  /* ---------- 重置 ---------- */
  useEffect(() => {
    if (!showResetModal) return
    setResetCountdown(3)
    const timer = window.setInterval(() => {
      setResetCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [showResetModal])

  const handleReset = async () => {
    if (resetCountdown > 0 || resetting) return
    setResetting(true)
    try {
      await api.resetAllData()
      setShowResetModal(false)
      await loadRecords()
      showToast('练习数据已重置')
    } catch (error) {
      console.error('重置失败:', error)
      showToast('重置失败，请重试')
    } finally {
      setResetting(false)
    }
  }

  /* ---------- 分页 ---------- */
  const recordPageSize = isMobile ? 12 : RECORD_PAGE_SIZE
  const memoPageSize = isMobile ? 12 : MEMO_PAGE_SIZE
  const recordPageCount = Math.max(1, Math.ceil(records.length / recordPageSize))
  const memoPageCount = Math.max(1, Math.ceil(memos.length / memoPageSize))

  useEffect(() => { setRecordPage(0) }, [records.length])
  useEffect(() => { setMemoPage(0) }, [memos.length])

  const handleRecordsScroll = () => {
    const el = recordsPagerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== recordPage && idx >= 0 && idx < recordPageCount) setRecordPage(idx)
  }
  const scrollToRecordPage = (idx: number) => {
    const el = recordsPagerRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setRecordPage(idx)
  }
  const handleMemosScroll = () => {
    const el = memosPagerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== memoPage && idx >= 0 && idx < memoPageCount) setMemoPage(idx)
  }
  const scrollToMemoPage = (idx: number) => {
    const el = memosPagerRef.current
    if (!el) return
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setMemoPage(idx)
  }

  const renderPager = (
    pageCount: number,
    current: number,
    onJump: (i: number) => void
  ) => {
    if (pageCount <= 1) return null
    return (
      <div className="pager-dots">
        <button
          className="pager-arrow"
          onClick={() => onJump(Math.max(0, current - 1))}
          disabled={current === 0}
        >‹</button>
        <div className="pager-numbers">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              className={`pager-num ${i === current ? 'active' : ''}`}
              onClick={() => onJump(i)}
            >{i + 1}</button>
          ))}
        </div>
        <button
          className="pager-arrow"
          onClick={() => onJump(Math.min(pageCount - 1, current + 1))}
          disabled={current === pageCount - 1}
        >›</button>
      </div>
    )
  }

  const renderRecordsPage = (pageIdx: number) => {
    const slice = records.slice(pageIdx * recordPageSize, (pageIdx + 1) * recordPageSize)
    return (
      <div className="pager-page" key={pageIdx}>
        <div className={`records-grid ${isMobile ? 'mobile' : ''}`}>
          {slice.map(record => (
            <button
              key={record.id}
              className="record-card"
              onClick={() => setDetailRecord(record)}
            >
              <div className="record-card-feeling">{record.feeling_name}</div>
              <div className="record-card-meta">
                <span className="record-card-date">{fmtDay(record.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderMemosPage = (pageIdx: number) => {
    const slice = memos.slice(pageIdx * memoPageSize, (pageIdx + 1) * memoPageSize)
    return (
      <div className="pager-page" key={pageIdx}>
        <div className={`records-grid ${isMobile ? 'mobile' : ''}`}>
          {slice.map(memo => (
            <button
              key={memo.id}
              className="memo-card"
              onClick={() => setDetailMemo(memo)}
            >
              <div className="memo-card-title">
                {memo.title || '（无标题）'}
              </div>
              <div className="memo-card-date">{fmtDay(memo.createdAt)}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="content records-page">
      <h2 className="page-title">记录中心</h2>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">总释放次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.today}</div>
          <div className="stat-label">今日释放</div>
        </div>
      </div>

      <div className="records-tabs">
        <button
          className={`records-tab ${tab === 'records' ? 'active' : ''}`}
          onClick={() => setTab('records')}
        >释放记录</button>
        <button
          className={`records-tab ${tab === 'memos' ? 'active' : ''}`}
          onClick={() => setTab('memos')}
        >感悟备忘录</button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : tab === 'records' ? (
        <>
          <div className="records-actions">
            <button className="btn btn-secondary" onClick={() => fileInputRecordsRef.current?.click()}>导入记录</button>
            <button className="btn btn-secondary" onClick={handleExportRecords} disabled={records.length === 0}>导出记录</button>
            <button className="btn btn-danger" onClick={handleClearAll} disabled={records.length === 0}>清空释放记录</button>
            <button className="btn reset-data-btn" onClick={() => setShowResetModal(true)}>重置练习数据</button>
            <input
              ref={fileInputRecordsRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportRecords}
            />
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <p>暂无释放记录</p>
              <p className="hint">开始在「练习释放」中释放你的情绪吧！</p>
            </div>
          ) : (
            <>
              <div className="records-pager" ref={recordsPagerRef} onScroll={handleRecordsScroll}>
                {Array.from({ length: recordPageCount }).map((_, i) => renderRecordsPage(i))}
              </div>
              {renderPager(recordPageCount, recordPage, scrollToRecordPage)}
            </>
          )}
        </>
      ) : (
        <>
          <div className="records-actions">
            <button className="btn btn-primary" onClick={openNewMemo}>+ 写感悟</button>
            <button className="btn btn-secondary" onClick={() => fileInputMemosRef.current?.click()}>导入</button>
            <button className="btn btn-secondary" onClick={handleExportMemos} disabled={memos.length === 0}>导出</button>
            <input
              ref={fileInputMemosRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportMemos}
            />
          </div>

          {memos.length === 0 ? (
            <div className="empty-state">
              <p>还没有感悟记录</p>
              <p className="hint">释放练习后，把你的领悟写下来吧</p>
            </div>
          ) : (
            <>
              <div className="records-pager" ref={memosPagerRef} onScroll={handleMemosScroll}>
                {Array.from({ length: memoPageCount }).map((_, i) => renderMemosPage(i))}
              </div>
              {renderPager(memoPageCount, memoPage, scrollToMemoPage)}
            </>
          )}
        </>
      )}

      {/* 释放记录详情 */}
      {detailRecord && (
        <div className="detail-overlay" onClick={() => setDetailRecord(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <h3>释放详情</h3>
              <button className="close-btn" onClick={() => setDetailRecord(null)}>×</button>
            </div>
            <div className="detail-body">
              <div className="detail-row">
                <span className="detail-label">情绪</span>
                <span className="emotion-tag">{detailRecord.feeling_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">时间</span>
                <span className="detail-value">{fmtDate(detailRecord.created_at)}</span>
              </div>
              {detailRecord.note && (
                <div className="detail-row">
                  <span className="detail-label">备注</span>
                  <div className="detail-note">{detailRecord.note}</div>
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn btn-danger" onClick={() => { handleDeleteRecord(detailRecord.id); setDetailRecord(null) }}>删除</button>
              <button className="btn btn-secondary" onClick={() => setDetailRecord(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 备忘录详情 */}
      {detailMemo && (
        <div className="detail-overlay" onClick={() => setDetailMemo(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <h3>{detailMemo.title || '（无标题）'}</h3>
              <button className="close-btn" onClick={() => setDetailMemo(null)}>×</button>
            </div>
            <div className="detail-body">
              <div className="detail-row">
                <span className="detail-label">时间</span>
                <span className="detail-value">{fmtDate(detailMemo.createdAt)}</span>
              </div>
              {detailMemo.text && (
                <div className="detail-memo-text">{detailMemo.text}</div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn btn-danger" onClick={() => deleteMemo(detailMemo.id)}>删除</button>
              <button className="btn btn-secondary" onClick={() => openEditMemo(detailMemo)}>编辑</button>
              <button className="btn btn-primary" onClick={() => setDetailMemo(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 备忘录编辑器 */}
      {showMemoEditor && (
        <div className="detail-overlay" onClick={() => setShowMemoEditor(false)}>
          <div className="detail-modal memo-editor-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <h3>{editingMemoId ? '编辑感悟' : '写感悟'}</h3>
              <button className="close-btn" onClick={() => setShowMemoEditor(false)}>×</button>
            </div>
            <div className="detail-body">
              <input
                type="text"
                className="memo-title-input"
                placeholder="标题（必填）"
                value={memoTitle}
                onChange={e => setMemoTitle(e.target.value)}
                maxLength={50}
              />
              <textarea
                className="memo-text-input"
                placeholder="写下此刻的感悟、体悟或心得……"
                value={memoText}
                onChange={e => setMemoText(e.target.value)}
                rows={8}
              />
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => setShowMemoEditor(false)}>取消</button>
              <button className="btn btn-primary" onClick={saveMemo}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 重置警告 */}
      {showResetModal && (
        <div className="reset-modal-overlay" onClick={() => !resetting && setShowResetModal(false)}>
          <div className="reset-modal" onClick={e => e.stopPropagation()}>
            <div className="reset-modal-icon">⚠️</div>
            <h3>重置练习数据</h3>
            <p className="reset-warning-text">此操作将<strong>永久删除</strong>你的全部练习数据：</p>
            <ul className="reset-warning-list">
              <li>所有练习中的事件与感受</li>
              <li>所有练习进度</li>
              <li>所有释放记录</li>
            </ul>
            <p className="reset-warning-final">删除后<strong>无法恢复</strong>，确定要继续吗？</p>
            <div className="reset-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)} disabled={resetting}>取消</button>
              <button
                className={`btn reset-confirm-btn ${resetCountdown > 0 ? 'armed-waiting' : ''}`}
                onClick={handleReset}
                disabled={resetCountdown > 0 || resetting}
              >
                {resetting ? '正在重置…' : resetCountdown > 0 ? `请再想想（${resetCountdown}s）` : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="records-toast">{toast}</div>}
    </div>
  )
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
