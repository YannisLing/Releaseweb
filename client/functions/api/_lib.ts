import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()

function getSecret(env: any): Uint8Array {
  const secret = env.JWT_SECRET || 'your-secret-key-change-in-production'
  return encoder.encode(secret)
}

export async function generateToken(userId: number, env: any): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret(env))
}

export async function verifyToken(token: string, env: any): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(env))
    return { userId: payload.userId as number }
  } catch {
    return null
  }
}

export function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
