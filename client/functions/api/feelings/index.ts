import { json } from '../_lib'

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { eventId, name } = await context.request.json()
    if (!eventId || !name) {
      return json({ error: 'Event ID and feeling name are required' }, 400)
    }
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const event = await db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').bind(eventId, userId).first()
    if (!event) {
      return json({ error: 'Unauthorized: Event does not belong to user' }, 403)
    }
    const result = await db.prepare(
      'INSERT INTO feelings (event_id, name) VALUES (?, ?)'
    ).bind(eventId, name).run()
    const feelingId = result.meta.last_row_id as number
    return json({ id: feelingId, eventId, name, released: false, feelingGood: false })
  } catch {
    return json({ error: 'Failed to create feeling' }, 500)
  }
}
