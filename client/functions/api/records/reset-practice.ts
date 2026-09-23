import { json } from '../_lib'

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.batch([
      db.prepare('DELETE FROM feelings WHERE event_id IN (SELECT id FROM events WHERE user_id = ?)').bind(userId),
      db.prepare('DELETE FROM events WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM practice_progress WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM release_records WHERE user_id = ?').bind(userId),
    ])
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to reset practice data' }, 500)
  }
}
