import { json } from '../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const practiceId = context.params.practiceId as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const result = await db.prepare(
      'SELECT * FROM practice_progress WHERE user_id = ? AND practice_id = ?'
    ).bind(userId, practiceId).first()
    return json(result || null)
  } catch {
    return json({ error: 'Failed to fetch practice progress' }, 500)
  }
}

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const practiceId = context.params.practiceId as string
    const { attemptsMade, attemptsRequired, completed } = await context.request.json()
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.prepare(
      `INSERT OR REPLACE INTO practice_progress
       (user_id, practice_id, attempts_made, attempts_required, completed, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, practiceId, attemptsMade, attemptsRequired, completed ? 1 : 0).run()
    return json({ success: true, practiceId })
  } catch {
    return json({ error: 'Failed to update practice progress' }, 500)
  }
}
