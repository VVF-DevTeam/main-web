import { handlers } from '@/auth'
import { checkBotId } from 'botid/server'

export const GET = handlers.GET

export const POST = async (...args: Parameters<typeof handlers.POST>) => {
  const verification = await checkBotId()
  if (verification.isBot) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  return handlers.POST(...args)
}
