import { json } from '../_lib'

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const id = context.params.id as string
    const db = context.env.DB as D1Database
    const userId = context.data.userId as number
    await db.prepare('DELETE FROM release_records WHERE id = ? AND user_id = ?').bind(id, userId).run()
    return json({ success: true })
  } catch {
    return json({ error: 'Failed to delete record' }, 500)
  }
}
