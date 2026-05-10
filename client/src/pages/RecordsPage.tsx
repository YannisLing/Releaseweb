import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './RecordsPage.css'

interface Record {
  id: number
  date: string
  emotions: string[]
  intensity: number
  note: string
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, avgIntensity: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecords()
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

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条记录吗？')) {
      try {
        await api.deleteRecord(id)
        loadRecords()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const handleClearAll = () => {
    if (confirm('确定要清空所有记录吗？此操作不可恢复！')) {
      api.clearAllRecords().then(() => loadRecords())
    }
  }

  const handleExport = () => {
    const exportData = records.map(r => ({
      日期: r.date,
      感受: Array.isArray(r.emotions) ? r.emotions.join(', ') : r.emotions,
      强度: r.intensity,
      备注: r.note
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sedona-records-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="content records-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="content records-page">
      <h2 className="page-title">释放记录</h2>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">总释放次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.today}</div>
          <div className="stat-label">今日释放</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgIntensity}%</div>
          <div className="stat-label">平均强度</div>
        </div>
      </div>

      <div className="records-actions">
        <button className="btn btn-secondary" onClick={handleExport}>
          导出记录
        </button>
        <button className="btn btn-danger" onClick={handleClearAll}>
          清空所有
        </button>
      </div>

      <div className="records-list">
        {records.length === 0 ? (
          <div className="empty-state">
            <p>暂无释放记录</p>
            <p className="hint">开始在「练习释放」中释放你的情绪吧！</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <span className="record-date">{record.date}</span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(record.id)}
                >
                  删除
                </button>
              </div>
              <div className="record-emotions">
                {Array.isArray(record.emotions) ? (
                  record.emotions.map((emotion, index) => (
                    <span key={index} className="emotion-tag">{emotion}</span>
                  ))
                ) : (
                  <span className="emotion-tag">{record.emotions}</span>
                )}
              </div>
              {record.note && (
                <div className="record-note">{record.note}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}