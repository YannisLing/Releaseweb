import { json } from '../_lib'

export const onRequestPost: PagesFunction = async () => {
  return json({ success: true, message: 'Logout successful' })
}
