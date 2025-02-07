'use server'

import { prisma } from '../db'

export const updateAction = async (data: {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
}) => {
  try {
    // Validate input data
    if (!data.email) {
      return { success: false, error: 'Email is required' }
    }
    {/* Update Profile Photo */}
    // TODO

    
    {/* Update Profile Info */}
    const updatedUser = await prisma.user.update({
      where: { email: data.email },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        age: data.age,
      },
    })  

    if (updatedUser) {
      return { success: true, data: updatedUser }
    } else {
      return { success: false, error: 'Failed to update user' }
    }
  } catch (error) {
    console.error('Error in updateAction:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating the profile',
    }
  }
}