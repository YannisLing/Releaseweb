import { json } from '../../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const practiceId = context.params.practiceId as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const { results } = await db.prepare(
      'SELECT * FROM events WHERE user_id = ? AND practice_id = ? ORDER BY created_at'
    ).bind(userId, practiceId).all()
    return json(results)
  } catch {
    return json({ error: 'Failed to fetch events' }, 500)
  }
}
