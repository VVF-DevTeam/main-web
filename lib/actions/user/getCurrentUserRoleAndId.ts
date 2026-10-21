'use server'

import { auth } from '@/auth'
import { normalizeUserRoles } from '@/lib/user/normalizeUserRoles'

export const getCurrentUserRoleAndId = async () => {
    try {
        const session = await auth()
        return {
          role: normalizeUserRoles(session?.user?.role),
          id: session?.user?.id ?? '',
        }
    } catch (error) {
        console.error('Error getting current user role and id:', error)
        return { role: ["USER"], id: "" }
    }
}