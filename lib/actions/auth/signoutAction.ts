"use server"
import { signOut } from '@/auth'

export const signOutAction = async () => {
  try {
    await signOut({redirect: false})
    return {
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Error signing out',
    }
  }
}
