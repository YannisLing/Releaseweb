import { json } from '../../_lib'

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const eventId = context.params.eventId as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const { results } = await db.prepare(
      `SELECT f.* FROM feelings f
       JOIN events e ON f.event_id = e.id
       WHERE e.user_id = ? AND f.event_id = ?
       ORDER BY f.created_at`
    ).bind(userId, eventId).all()
    return json(results)
  } catch {
    return json({ error: 'Failed to fetch feelings' }, 500)
  }
}
