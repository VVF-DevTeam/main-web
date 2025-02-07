'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import Image from 'next/image'

import { updateAction } from '@/lib/actions/updateAction'

interface userInfoProps {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
}
const ProfileInfo = ({ user }: { user: userInfoProps }) => {
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.image || ''
  )
  const [profileData, setProfileData] = useState<userInfoProps>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    age: user?.age || '',
    image: user?.image || '',
  })

  const [error, setError] = useState('')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(URL.createObjectURL(event.target.files[0]))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const updatedData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        age: profileData.age,
        image: profileImage,
      }
      const result = await updateAction(updatedData)

      if (result.success) {
        alert('Profile updated successfully!')
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    }
  }

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Account Information
      </h1>

      {/* Profile Image Upload */}
      <div>
        <h2 className="mb-2 text-xl font-semibold">Profile Photo</h2>
        <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-400 text-blue-600 hover:bg-gray-50">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <User className="h-10 w-10 text-gray-600" />
              <p className="mt-1 text-sm font-medium text-gray-700">
                Add a Profile Image
              </p>
              <p className="text-xs text-gray-500">
                Drag and drop or choose a file to upload
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/*"
            aria-label="Upload Profile Image"
          />
        </label>
      </div>
      {/* Contact Information Form */}
      <div className="max-w-xl space-y-6">
        <div>
          <label className="block">
            <span className="text-sm text-gray-700">Full Name</span>
            <input
              type="text"
              name="name"
              value={profileData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              value={profileData.email || ''}
              readOnly
              className="mt-1 block w-full cursor-not-allowed rounded border border-gray-300 bg-gray-50 p-2 hover:bg-gray-100"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm text-gray-700">Age</span>
            <input
              type="text"
              name="age"
              value={profileData.age || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm text-gray-700">Phone</span>
            <input
              type="text"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="text-sm text-gray-700">Address</span>
            <input
              type="text"
              name="address"
              value={profileData.address || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSaveProfile}
          className="rounded bg-[#F05537] px-6 py-2 text-white hover:bg-[#D64A2F]"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default ProfileInfo
