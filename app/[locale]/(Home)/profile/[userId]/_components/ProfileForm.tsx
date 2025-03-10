'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { User } from 'lucide-react'

import { updateAction } from '@/lib/actions/updateAction'
import { useToast } from '@/hooks/use-toast'
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

const profileSchema = z.object({
  email: z.string().email('Invalid email').nonempty(),
  name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  age: z.string().optional(),
  image: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const ProfileForm = ({ user }: { user: ProfileFormValues }) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  const { toast } = useToast()
  const [imagePreview, setImagePreview] = useState(user.image || '')

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        form.setValue('image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await updateAction(data)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully!',
        })
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Update failed',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-32">
      <h1 className="mt-8 text-xl font-semibold md:text-3xl lg:mt-12">
        {t('profile-info-header')}
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-y-6 pt-2 md:grid-cols-2 md:gap-x-8"
        >
          {/* Profile Image Upload */}
          <div className="col-span-2 flex flex-col items-center">
            <label className="relative h-48 w-48 cursor-pointer rounded-lg border-2 border-dashed border-bgColor-black p-4 hover:bg-bgColor-gray/10">
              {imagePreview ? (
                <div className="flex items-center justify-center">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
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
                  <p className="text-sm text-textColor-gray">
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
                  <Input {...field} placeholder="1234567890" />
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
              className="bg-bgColor-brand text-textColor-white hover:bg-bgColor-brandLight"
            >
              {t('Save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ProfileForm
