import { verifyToken, json } from './_lib'

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url)
  // 跳过 auth 路由
  if (url.pathname.startsWith('/api/auth/')) {
    return context.next()
  }

  const authHeader = context.request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized: No token provided' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const decoded = await verifyToken(token, context.env)

  if (!decoded) {
    return json({ error: 'Unauthorized: Invalid token' }, 401)
  }

  // 把 userId 存到 context.data 供后续处理函数使用
  context.data.userId = decoded.userId
  return context.next()
}
