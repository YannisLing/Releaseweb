import bcrypt from 'bcryptjs'
import { generateToken, json } from '../_lib'

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { email, password } = await context.request.json()
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400)
    }

    const db = context.env.DB as D1Database
    const { results } = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).all()
    const user = results[0] as any

    if (!user) {
      return json({ error: 'Invalid email or password' }, 401)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return json({ error: 'Invalid email or password' }, 401)
    }

    const token = await generateToken(user.id, context.env)
    return json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch {
    return json({ error: 'Failed to login' }, 500)
  }
}
