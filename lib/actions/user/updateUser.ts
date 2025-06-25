'use server'

import { prisma } from '../../db'

export const updateUser = async (data: {
  name?: string | null
  email: string
  phone?: string | null 
  address?: string | null 
  age?: string | null 
  image?: string | null 
  phoneVerified?: boolean | null
}) => {
  try {
    // Validate input data
    if (!data.email) {
      return { success: false, error: 'Email is required' }
    }

    // Ensure undefined values are converted to null before updating in Prisma
    const updatedUser = await prisma.user.update({
      where: { email: data.email },
      data: {
        name: data.name,
        phone: data.phone ?? null,
        address: data.address ?? null,
        age: data.age ?? null,
        image: data.image ?? null, // Include image update if needed
        phoneVerified: data.phoneVerified ?? null, // Handle phone verification status
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
