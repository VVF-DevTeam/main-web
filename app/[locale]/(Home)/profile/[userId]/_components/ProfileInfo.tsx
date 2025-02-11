'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import Image from 'next/image'

import { updateAction } from '@/lib/actions/updateAction'

import { useTranslation } from 'react-i18next'

interface UserInfoProps {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
}

const ProfileInfo = ({ user }: { user: UserInfoProps }) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  console.log(t('acc-setting'))
  console.log(t('about-navLink'))
  const [profileData, setProfileData] = useState<UserInfoProps>({
    name: user?.name ?? null,
    email: user?.email ?? '',
    phone: user?.phone ?? null,
    address: user?.address ?? null,
    age: user?.age ?? null,
    image: user?.image ?? null,
  })

  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()

      reader.onloadend = () => {
        setProfileData((prev) => ({
          ...prev,
          image: reader.result as string,
        }))
      }

      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value || null,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const result = await updateAction(profileData)

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
        {t('profile-info-header')}
      </h1>

      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t('profile-photo')}
        </h2>

        <label className="relative flex h-48 w-48 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-400 p-4 hover:bg-gray-50">
          {profileData.image ? (
            <Image
              src={profileData.image}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <User className="h-10 w-10 text-blue-600" />
              <p className="text-lg font-bold uppercase text-blue-600">
                {t('profile-photo-add')}
              </p>
              <p className="text-sm text-gray-500">
                {t('profile-photo-change')}
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

      {/* Contact Information Title */}
      <h2 className="mb-4 mt-8 text-xl font-semibold text-gray-900">
        {t('contact-info')}
      </h2>

      {/* Contact Information Form */}
      <div className="max-w-xl space-y-6">
        {[
          {
            label: t('fullName'),
            name: 'name',
            type: 'text',
            value: profileData.name,
            readOnly: false,
          },
          {
            label: t('email'),
            name: 'email',
            type: 'email',
            value: profileData.email,
            readOnly: true,
          },
          {
            label: t('age'),
            name: 'age',
            type: 'text',
            value: profileData.age,
            readOnly: false,
          },
          {
            label: t('phone'),
            name: 'phone',
            type: 'text',
            value: profileData.phone,
            readOnly: false,
          },
          {
            label: t('address'),
            name: 'address',
            type: 'text',
            value: profileData.address,
            readOnly: false,
          },
        ].map(({ label, name, type, value, readOnly }) => (
          <div key={name}>
            <label className="block">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type={type}
                name={name}
                value={value || ''}
                onChange={handleChange}
                readOnly={readOnly}
                className={`mt-1 block w-full rounded border border-gray-300 p-2 ${
                  readOnly
                    ? 'cursor-not-allowed bg-gray-50 hover:bg-gray-100'
                    : ''
                }`}
              />
            </label>
          </div>
        ))}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSaveProfile}
          className="mt-4 w-full rounded bg-[#F05537] px-6 py-2 text-white transition hover:bg-[#D64A2F]"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default ProfileInfo
