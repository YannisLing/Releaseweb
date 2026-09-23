import { json } from '../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const { results } = await db.prepare(
      'SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()
    return json(results)
  } catch {
    return json({ error: 'Failed to fetch events' }, 500)
  }
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { practiceId, exerciseId, situation } = await context.request.json()
    if (!practiceId || !exerciseId) {
      return json({ error: 'Practice ID and exercise ID are required' }, 400)
    }
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const situationText = situation || ''
    const result = await db.prepare(
      'INSERT INTO events (user_id, practice_id, exercise_id, situation) VALUES (?, ?, ?, ?)'
    ).bind(userId, practiceId, exerciseId, situationText).run()
    const eventId = result.meta.last_row_id as number
    return json({ id: eventId, practiceId, exerciseId, situation: situationText })
  } catch {
    return json({ error: 'Failed to create event' }, 500)
  }
}
