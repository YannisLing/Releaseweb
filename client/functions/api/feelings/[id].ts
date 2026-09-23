import { json } from '../_lib'

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const id = context.params.id as string
    const { released, feelingGood } = await context.request.json()
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const feeling = await db.prepare(
      `SELECT * FROM feelings f JOIN events e ON f.event_id = e.id WHERE f.id = ? AND e.user_id = ?`
    ).bind(id, userId).first()
    if (!feeling) {
      return json({ error: 'Unauthorized: Feeling does not belong to user' }, 403)
    }
    await db.prepare(
      'UPDATE feelings SET released = ?, feeling_good = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(released ? 1 : 0, feelingGood ? 1 : 0, id).run()
    return json({ success: true, feelingId: id })
  } catch {
    return json({ error: 'Failed to update feeling' }, 500)
  }
}

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params.id as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    const feeling = await db.prepare(
      `SELECT * FROM feelings f JOIN events e ON f.event_id = e.id WHERE f.id = ? AND e.user_id = ?`
    ).bind(id, userId).first()
    if (!feeling) {
      return json({ error: 'Unauthorized: Feeling does not belong to user' }, 403)
    }
    await db.prepare('DELETE FROM feelings WHERE id = ?').bind(id).run()
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to delete feeling' }, 500)
  }
}
