import { json } from '../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const { results } = await db.prepare(
      'SELECT * FROM practice_progress WHERE user_id = ? ORDER BY practice_id'
    ).bind(userId).all()
    return json(results)
  } catch {
    return json({ error: 'Failed to fetch practice progress' }, 500)
  }
}

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.prepare('DELETE FROM practice_progress WHERE user_id = ?').bind(userId).run()
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to reset practice progress' }, 500)
  }
}
