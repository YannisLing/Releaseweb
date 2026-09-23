import { json } from '../_lib'

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { records } = await context.request.json()
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number

    if (!Array.isArray(records)) {
      return json({ error: 'records must be an array' }, 400)
    }

    const stmts = []
    let imported = 0
    for (const r of records) {
      const name = r.feelingName || r.feeling_name || r['感受']
      if (!name) continue
      const intensity = Number(r.intensity ?? r['强度'] ?? 5) || 5
      const note = r.note || r['备注'] || ''
      let createdAt = r.createdAt || r.created_at || r['日期']
      if (!createdAt) {
        createdAt = new Date().toISOString()
      } else if (!/\d{4}-\d{2}-\d{2}T/.test(createdAt)) {
        const d = new Date(createdAt)
        createdAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
      }
      stmts.push(
        db.prepare(
          'INSERT INTO release_records (user_id, feeling_name, intensity, note, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(userId, name, intensity, note, createdAt)
      )
      imported++
    }

    if (stmts.length > 0) {
      await db.batch(stmts)
    }
    return json({ success: true, imported })
  } catch {
    return json({ error: 'Failed to import records' }, 500)
  }
}
