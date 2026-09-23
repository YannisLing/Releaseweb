import { json } from '../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const { results } = await db.prepare(
      'SELECT * FROM release_records WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    const today = new Date().toDateString()
    const todayCount = results.filter((r: any) => new Date(r.created_at).toDateString() === today).length

    return json({
      records: results,
      stats: { total: results.length, today: todayCount },
    })
  } catch {
    return json({ error: 'Failed to fetch records' }, 500)
  }
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { feelingName, intensity, note } = await context.request.json()
    if (!feelingName) {
      return json({ error: 'Feeling name is required' }, 400)
    }
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const result = await db.prepare(
      'INSERT INTO release_records (user_id, feeling_name, intensity, note) VALUES (?, ?, ?, ?)'
    ).bind(userId, feelingName, intensity || 5, note || '').run()
    return json({
      id: result.meta.last_row_id,
      feelingName,
      intensity: intensity || 5,
      note: note || '',
      createdAt: new Date().toISOString(),
    })
  } catch {
    return json({ error: 'Failed to save record' }, 500)
  }
}

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.prepare('DELETE FROM release_records WHERE user_id = ?').bind(userId).run()
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to clear records' }, 500)
  }
}
