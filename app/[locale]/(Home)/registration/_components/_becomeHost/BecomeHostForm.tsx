'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import AvailabilitySelector from './AvailabilitySelector'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

const hostApplicationSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  postalCode: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Invalid phone'),
  teachHost: z.string().min(1, 'Please tell us what you want to teach/host'),
  experience: z.string().min(1, 'Please share your experience'),
})

export default function BecomeHostForm({
  locale,
  userId,
}: {
  locale: string
  userId: string
}) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['host', 'event'])
  const [availability, setAvailability] = useState<Record<string, string[]>>({})

  const currentDateTime = getCurrentDateTime()
  const form = useForm<z.infer<typeof hostApplicationSchema>>({
    resolver: zodResolver(hostApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      email: '',
      phone: '',
      teachHost: '',
      experience: '',
    },
  })
  const onSubmit = async (values: z.infer<typeof hostApplicationSchema>) => {
    // Check if availability is empty
    const hasAvailability = Object.values(availability).some(
      (slots) => slots.length > 0
    )

    if (!hasAvailability) {
      toast.error('Please select your availability', {
        description:
          'You must select at least one time slot to submit your host application.',
        style: {
          color: '#ef4444',
        },
      })
      return
    }
    try {
      const availabilityData = Object.entries(availability)
        .filter(([, slots]) => slots.length > 0)
        .reduce(
          (acc, [date, slots]) => {
            acc[date] = slots
            return acc
          },
          {} as Record<string, string[]>
        )

      const payload = {
        ...values,
        availability: availabilityData,
        userId,
      }

      const response = await axios.post(
        '/api/jobs/apply/host',
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      if (response.status === 200) {
        toast.success(
          'Job applied successfully. Thank you for your application! Please wait for our response, we will get back to you soon.'
        )
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Duplicate Application', {
            description: (
              <div className="flex flex-col gap-1">
                <span>
                  You have already applied for this job, if you want to add new
                  information, please send an email to the admin
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        } else {
          toast.error('Error making request to database', {
            description: (
              <div className="flex flex-col gap-1">
                <span>
                  {error.response?.data ||
                    'Something went wrong. Please contact the admin'}
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        }
      } else if (error instanceof Error) {
        toast.error(
          error?.message || 'Something went wrong. Please contact the admin.',
          {
            description: (
              <div className="flex flex-col gap-1">
                <span>Something went wrong. Please contact the admin.</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          }
        )
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-bgColor-grayLight py-6 sm:py-8 lg:py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-3 text-2xl font-bold text-textColor-brand sm:mb-4 sm:text-3xl lg:text-4xl">
            {t('becomeHost-header')}
          </h1>
          <p className="text-base text-textColor-gray sm:text-lg lg:text-xl">
            {t('becomeHost-description')}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-bgColor-white rounded-lg p-4 sm:p-6 lg:p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              {/* General Information Section */}
              <div className="space-y-3 sm:space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-firstname')}
                        </FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-lastname')}
                        </FormLabel>
                        <FormControl>
                          <Input autoComplete="family-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-phone')}
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" autoComplete="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-textColor-brand">
                        {t('host-address')}
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="street-address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-city')}
                        </FormLabel>
                        <FormControl>
                          <Input autoComplete="address-level2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-country')}
                        </FormLabel>
                        <FormControl>
                          <Input autoComplete="country-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-textColor-brand">
                          {t('host-postalCode')}
                        </FormLabel>
                        <FormControl>
                          <Input autoComplete="postal-code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-3 sm:space-y-4">
                <FormField
                  control={form.control}
                  name="teachHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-textColor-brand">
                        {t('host-description')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-textColor-brand">
                        {t('host-experience')}
                      </FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability Section */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-textColor-black text-lg font-semibold sm:text-xl">
                  {t('host-availability')}
                </h2>
                <div className="border-b border-gray-200" />
                <div className="w-full">
                  <AvailabilitySelector
                    value={availability}
                    onChange={setAvailability}
                    locale={locale}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="rounded-lg bg-bgColor-blue px-4 py-3 font-medium text-textColor-white transition-colors hover:bg-bgColor-blue/80 focus:outline-none focus:ring-2 focus:ring-bgColor-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                >
                  {form.formState.isSubmitting
                    ? t('host-submitting')
                    : t('host-submit')}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
