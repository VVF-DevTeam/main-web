'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import {  User } from 'lucide-react'
import { Select } from '@/components/ui/select'
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { updateUser } from '@/lib/actions/user/updateUser'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FiEdit2 } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'

const profileSchema = z.object({
  email: z.string().email('Invalid email').nonempty(),
  name: z.string(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  address: z.string().optional(),
  age: z.string().optional(),
  image: z.string().optional(),
})


// Types
import { UserInfoProps } from '@/lib/types/userInfo'

type ProfileFormValues = z.infer<typeof profileSchema>

const UpdateProfileForm = ({ user }: { user: UserInfoProps }) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('profile')
  const [imagePreview, setImagePreview] = useState(user.image || '')
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  })

  // Extract extension and number from user.phone if present
  const initialPhone = user.phone || ''
  let initialExtension = '+1'
  let initialPhoneNumber = initialPhone
  if (initialPhone.startsWith('+84')) {
    initialExtension = '+84'
    initialPhoneNumber = initialPhone.replace(/^\+84/, '')
  } else if (initialPhone.startsWith('+1')) {
    initialExtension = '+1'
    initialPhoneNumber = initialPhone.replace(/^\+1/, '')
  }
  const [phoneExtension, setPhoneExtension] = useState<string>(initialExtension)

  // Set the phone field to just the number part for editing
  React.useEffect(() => {
    form.setValue('phone', initialPhoneNumber)
    // eslint-disable-next-line
  }, [])

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true)
      const file = event.target.files[0]
      console.log(file)
      const formData = new FormData()
      formData.append('file', file)
      const response = await axiosInstance.post('/api/users/avatars', formData)
      if (response.status === 200) {
        setImagePreview(response.data.url)
        form.setValue('image', response.data.url)
      }
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      // Combine extension and phone number
      const fullPhone = data.phone ? `${phoneExtension}${data.phone}` : ''
      const response = await updateUser({ ...data, phone: fullPhone })
      if (response.success) {
        toast.success('Profile updated successfully!', {
          style: {
            color: '#22c55e',
          },
        })
      } else {
        toast.error('Update failed', {
          description:
            (response.error || 'Update failed') +
            ', this phone number may have been used by another user',
          style: {
            color: '#ef4444',
          },
        })
      }
    } catch (error) {
      console.log(error)
      toast.error('Update failed', {
        description: 'Please try again later',
        style: {
          color: '#ef4444',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-32">
      <h1 className="text-textColor-black text-xl font-semibold md:text-3xl lg:mt-12">
        {t('profile-info-header')}
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-6 pt-2 md:grid md:grid-cols-2 md:gap-x-8"
        >
          {/* Profile Image Upload */}
          <div className="col-span-2 flex flex-col items-center">
            <label className="relative h-48 w-48 cursor-pointer rounded-lg border-2 border-dashed border-bgColor-black p-4 hover:bg-bgColor-gray100">
              {imagePreview ? (
                <div className="flex items-center justify-center">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    fill
                    className="rounded-lg object-cover"
                  />
                  <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-bgColor-blue p-2 transition-colors hover:bg-bgColor-blue/50">
                    <FiEdit2 className="h-4 w-4 text-textColor-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-center">
                  <User className="h-10 w-10" />
                  <p className="text-lg font-bold uppercase text-textColor-blue">
                    {t('profile-photo-add')}
                  </p>
                  <p className="text-sm text-textColor-gray500">
                    {t('profile-photo-change')}
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fullName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email (Read-only) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('age')}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="30" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <div className="flex">
                    <Select
                      value={phoneExtension}
                      onValueChange={setPhoneExtension}
                    >
                      <SelectTrigger className="w-28 rounded-r-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">(🇨🇦) +1</SelectItem>
                        <SelectItem value="+84">(🇻🇳) +84</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      {...field}
                      placeholder="1234567890"
                      className="rounded-l-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('address')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 Main St" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="col-span-2 mt-6 flex justify-center">
            <Button
              type="submit"
              variant="default"
            >
              {t('Save')}
            </Button>
          </div>
        </form>
      </Form>

      {isLoading && <Loader />}
    </div>
  )
}

export default UpdateProfileForm
