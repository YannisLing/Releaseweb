import bcrypt from 'bcryptjs'
import { generateToken, json } from '../_lib'

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { email, password, name } = await context.request.json()
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400)
    }

    const db = context.env.DB as D1Database
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const result = await db.prepare(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
      ).bind(email, hashedPassword, name || 'User').run()

      const userId = result.meta.last_row_id as number
      const token = await generateToken(userId, context.env)
      return json({
        success: true,
        token,
        user: { id: userId, email, name: name || 'User' },
      })
    } catch (err: any) {
      if (err.message?.includes('UNIQUE constraint failed')) {
        return json({ error: 'Email already exists' }, 400)
      }
      return json({ error: 'Failed to register user' }, 500)
    }
  } catch {
    return json({ error: 'Failed to register user' }, 500)
  }
}
