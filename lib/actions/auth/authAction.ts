'use server'
import { signIn } from '@/auth'
import { authType } from '../../types/authTpes'
export const authAction = async (provider: authType) => {
     await signIn(provider, {redirectTo: '/events' })
}
