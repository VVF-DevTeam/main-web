'use server'

import { auth } from '@/auth'

export const getCurrentUserRoleAndId = async () => {
    try {
        const session = await auth()
        return { role: session?.user?.role ?? ["USER"], id: session?.user?.id ?? "" }
    } catch (error) {
        console.error('Error getting current user role and id:', error)
        return { role: ["USER"], id: "" }
    }
}