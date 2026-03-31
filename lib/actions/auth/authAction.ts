'use server'
import { signIn } from '@/auth'
import { authType } from '../../types/authTpes'
import { verifyTurnstileToken } from '@/lib/security/verifyTurnstile'

export const authAction = async (
     provider: authType,
     turnstileToken: string
) => {
     const turnstileResult = await verifyTurnstileToken(turnstileToken)
     if (!turnstileResult.ok) {
          throw new Error('Captcha verification failed')
     }

     await signIn(provider, { redirectTo: '/events' })
}
