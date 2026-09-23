import { json } from '../_lib'

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params.id as string
    const { situation, completed } = await context.request.json()
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const situationText = situation !== undefined ? situation : ''
    const completedValue = completed !== undefined ? (completed ? 1 : 0) : 0
    await db.prepare(
      'UPDATE events SET situation = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    ).bind(situationText, completedValue, id, userId).run()
    return json({ success: true, eventId: id })
  } catch {
    return json({ error: 'Failed to update event' }, 500)
  }
}

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params.id as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.prepare('DELETE FROM feelings WHERE event_id = ?').bind(id).run()
    await db.prepare('DELETE FROM events WHERE id = ? AND user_id = ?').bind(id, userId).run()
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to delete event' }, 500)
  }
}
