'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'

export interface GuestInfo {
  name: string
  email: string
  phone: string
}

interface GuestInfoFormProps {
  onSubmit: (representativeGuest: GuestInfo, otherGuests: GuestInfo[]) => void
  mainUserEmail?: string
  mainUserPhone?: string
  mainUserName?: string
  userId?: string | null
  buttonText?: string
  totalItemCount?: number
}

// Zod schema for a single guest
const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required').regex(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number'),
  phoneExtension: z.string().default('+1'),
})

// Schema for the entire form with multiple guests
const guestInfoFormSchema = z.object({
  guests: z.array(guestSchema).min(1, 'At least one guest is required'),
})

type GuestInfoFormValues = z.infer<typeof guestInfoFormSchema>

// Parse phone to extract extension and number
// Phone format: "+11234567890" or "+841234567890" -> extension: "+1"/"+84", number: "1234567890"
const parsePhone = (phone: string): { extension: string; number: string } => {
  if (!phone) return { extension: '+1', number: '' }

  if (phone.startsWith('+1')) {
    return { extension: '+1', number: phone.substring(2) }
  } else if (phone.startsWith('+84')) {
    return { extension: '+84', number: phone.substring(3) }
  }

  // Default to +1 if format is unknown
  return { extension: '+1', number: phone }
}

export default function GuestInfoForm({
  onSubmit,
  mainUserEmail = '',
  mainUserPhone = '',
  mainUserName = '',
  userId,
  buttonText,
  totalItemCount = 1,
}: GuestInfoFormProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['signIn-signUp', 'event'])

  const parsedPhone = parsePhone(mainUserPhone)

  // Initialize default values for all guests
  const defaultValues: GuestInfoFormValues = {
    guests: Array.from({ length: totalItemCount }, (_, i) => ({
      name: '',
      email: i === 0 ? mainUserEmail : '',
      phone: i === 0 ? parsedPhone.number : '',
      phoneExtension: i === 0 ? parsedPhone.extension : '+1',
    })),
  }

  const form = useForm<GuestInfoFormValues>({
    resolver: zodResolver(guestInfoFormSchema),
    defaultValues,
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: 'guests',
  })

  // Reinitialize when totalItemCount, initialEmail, or initialPhone changes
  useEffect(() => {
    const parsedPhone = parsePhone(mainUserPhone)
    const newGuests = Array.from({ length: totalItemCount }, (_, i) => ({
      name: i === 0 ? mainUserName : '',
      email: i === 0 ? mainUserEmail : '',
      phone: i === 0 ? parsedPhone.number : '',
      phoneExtension: i === 0 ? parsedPhone.extension : '+1',
    }))
    form.reset({ guests: newGuests })
  }, [totalItemCount, mainUserEmail, mainUserPhone, mainUserName, form])

  // Handle form submission
  const onSubmitForm = async (data: GuestInfoFormValues) => {
    // First guest is representative guest
    const representativeGuest: GuestInfo = {
      name: data.guests[0].name.trim(),
      email: data.guests[0].email.trim().toLowerCase(),
      phone: data.guests[0].phone.trim()
        ? `${data.guests[0].phoneExtension}${data.guests[0].phone.trim()}`
        : '',
    }

    // Remaining guests are other guests
    const otherGuests: GuestInfo[] = data.guests.slice(1).map(guest => ({
      name: guest.name.trim(),
      email: guest.email.trim().toLowerCase(),
      phone: guest.phone.trim()
        ? `${guest.phoneExtension}${guest.phone.trim()}`
        : '',
    }))

    // If user is logged in and mainUserName or mainUserPhone were originally empty,
    // update the user profile with the new values
    let hasPhoneError = false

    if (userId && userId.trim() !== '') {
      const updateData: { name?: string; phone?: string } = {}

      // Check if name was originally empty and now has a value
      if (!mainUserName || mainUserName.trim() === '') {
        if (representativeGuest.name && representativeGuest.name.trim() !== '') {
          updateData.name = representativeGuest.name
        }
      }

      // Check if phone was originally empty and now has a value
      if (!mainUserPhone || mainUserPhone.trim() === '') {
        if (representativeGuest.phone && representativeGuest.phone.trim() !== '') {
          updateData.phone = representativeGuest.phone
        }
      }

      // Only make API call if there's something to update
      if (Object.keys(updateData).length > 0) {
        try {
          await axiosInstance.put(
            '/api/users/edit',
            updateData,
            {
              headers: {
                userId: userId,
              },
            }
          )
        } catch (error) {
          // Check if it's a phone uniqueness error
          if (isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message || ''
            const statusCode = error.response?.status

            // Check for phone uniqueness error (Prisma P2002 unique constraint or explicit messages)
            const isPhoneUniquenessError =
              statusCode === 409 || // Conflict status code
              errorMessage?.toLowerCase().includes('phone') &&
              (errorMessage?.toLowerCase().includes('exists') ||
                errorMessage?.toLowerCase().includes('duplicate')) ||
              error.response?.data?.code === 'P2002' // Prisma unique constraint error code

            if (isPhoneUniquenessError) {
              hasPhoneError = true
              // Set error on the phone field for the representative guest (index 0)
              form.setError('guests.0.phone', {
                type: 'manual',
                message: 'This phone number is already associated with another account. Please use a different phone number.',
              })
            } else if (errorMessage) {
              // Other errors with messages
              console.error('Error updating profile:', errorMessage)
            } else {
              // Other errors without specific messages
              console.error('Error updating profile:', error)
            }
          } else {
            // Non-axios errors
            console.error('Error updating user profile:', error)
          }
        }
      }
    }

    // Only proceed with checkout if there was no phone uniqueness error
    if (!hasPhoneError) {
      onSubmit(representativeGuest, otherGuests)
    }
  }

  const renderGuestFields = (index: number, isRepresentative: boolean) => {
    return (
      <div key={index} className={index > 0 ? 'pt-6 border-t border-black' : ''}>
        {isRepresentative ? (
          <h4 className="text-sm font-semibold text-gray-700 mb-2 underline">
            Your Information
          </h4>
        ) : (
          <h4 className="text-sm font-semibold text-gray-700 mb-2 underline">
            Guest {index} Information
          </h4>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`guests.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('signIn-signUp:firstName')} & {t('signIn-signUp:lastName')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`guests.${index}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('signIn-signUp:email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>{t('signIn-signUp:phoneNumber')}</FormLabel>
            <div className="flex">
              <FormField
                control={form.control}
                name={`guests.${index}.phoneExtension`}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-28 rounded-r-none">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="+1">(🇨🇦) +1</SelectItem>
                        <SelectItem value="+84">(🇻🇳) +84</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`guests.${index}.phone`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="eg: 1234567890"
                        className="rounded-l-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Representative Guest Form (first) */}
        {renderGuestFields(0, true)}

        {/* Other Guests Forms */}
        {fields.slice(1).map((_, index) => renderGuestFields(index + 1, false))}

        <div className="pt-4 border-t">
          <Button type="submit" className="w-full group">
            {buttonText || t('event:reserve-button')}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t('event:guest-checkout-disclaimer')}
        </p>
      </form>
    </Form>
  )
}


