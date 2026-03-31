'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { useParams } from 'next/navigation'

import { signUpSchema } from '@/lib/zodSchema/signupSchema'
import { signupAction } from '@/lib/actions/auth/signupAction'
import { ServerActionResponse } from '@/lib/types/serverAction'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@radix-ui/react-separator'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import ProviderButtons from './ProviderButtons'
import Turnstile, { type BoundTurnstileObject } from 'react-turnstile'

const SignUpForm = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [showPassword, setShowPassword] = useState(false)
  const [phoneExtension, setPhoneExtension] = useState<string>('+1')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileRef = useRef<BoundTurnstileObject | null>(null)
  const turnstileTokenRef = useRef('')
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryAfterCaptchaFailRef = useRef(false)
  const pendingSubmissionRef = useRef<z.infer<typeof signUpSchema> | null>(null)
  const currentDateTime = getCurrentDateTime()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Cleanup token refresh interval on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
    }
  }, [])

  const isCaptchaFailure = (message: string) =>
    message.toLowerCase().includes('captcha verification failed')

  const refreshTurnstileToken = () => {
    if (!turnstileRef.current) return
    turnstileRef.current.reset()
    turnstileRef.current.execute()
  }

  const onSubmit = async (
    data: z.infer<typeof signUpSchema>,
    hasRetried = false
  ) => {
    if (!turnstileToken) {
      toast.error('Captcha is still verifying, please try again in a moment.')
      return
    }

    try {
      const fullPhone = data.phoneNumber
        ? `${phoneExtension}${data.phoneNumber}`
        : ''
      const response: ServerActionResponse = await signupAction({
        ...data,
        phoneNumber: fullPhone,
        locale: locale,
        turnstileToken,
      })

      if (response.success) {
        setShowSuccessMessage(true)
        form.reset()
        toast.success(response.message, {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        })
      } else {
        if (!hasRetried && isCaptchaFailure(response.message)) {
          pendingSubmissionRef.current = data
          retryAfterCaptchaFailRef.current = true
          refreshTurnstileToken()
          return
        }
        setShowSuccessMessage(false)
        toast.error(response.message, {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
        // Rotate token for any failed signup response
        refreshTurnstileToken()
      }
    } catch (error) {
      // Rotate token on unexpected signup errors too
      refreshTurnstileToken()
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
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
      throw error
    }
  }

  const handleFormSubmit = async (data: z.infer<typeof signUpSchema>) => {
    await onSubmit(data, false)
  }
  return (
    <div className="flex h-full w-full flex-col px-8 py-16 md:pr-12 lg:pl-16 xl:pl-28">
      {/* Form Header */}
      <h1 className="header-font-default mt-8 text-3xl font-semibold text-textColor-brand900 lg:mt-12">
        {t('register')}
      </h1>
      <p className="mt-6 text-sm">{t('description-signUp')}</p>
      <Separator className="my-4 h-[1px] w-full bg-bgColor-gray300" />

      {/* Social Sign Up Section */}
      <div className="mb-4 mt-3">
        <h2 className="mb-3 text-lg font-semibold text-textColor-brand900">
          {t('continue-with-social-accounts')}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('social-signup-recommendation')}
        </p>
        <ProviderButtons />
      </div>

      <div className="my-6 flex items-center gap-4">
        <Separator className="h-[1px] flex-1 bg-bgColor-gray300" />
        <span className="text-sm text-muted-foreground">or</span>
        <Separator className="h-[1px] flex-1 bg-bgColor-gray300" />
      </div>

      {/* Email Sign Up Section */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-textColor-brand900">
          {t('create-account-with-email')}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('email-signup-description')}
        </p>
        {showSuccessMessage && (
          <p className="mb-6 text-sm font-medium text-green-600">
            {t('account-created-success')}
          </p>
        )}

        {/* Form */}
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="flex-col-default grid-all-cols-2 mb-4 pr-5 pt-2 md:gap-y-8 lg:gap-x-6"
            >
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-textColor-brand900">
                      {t('firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg: Joe"
                        {...field}
                        className="border-2 text-textColor lg:max-w-[360px]"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-textColor-brand900">
                      {t('lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg: Smith"
                        {...field}
                        className="text-textColor lg:max-w-[360px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-textColor-brand900">
                      {t('email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="JoeSmith@gmail.com"
                        type="email"
                        {...field}
                        className="text-textColor lg:max-w-[360px]"
                      />
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
                    <FormLabel className="text-textColor-brand900">
                      {t('age')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg: 26"
                        type="number"
                        {...field}
                        className="text-textColor lg:max-w-[360px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-textColor-brand900">
                      {t('phoneNumber')}
                    </FormLabel>
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
                          placeholder="eg: 1234567890"
                          type="number"
                          className="rounded-l-none text-textColor lg:max-w-[360px]"
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
                    <FormLabel className="text-textColor-brand900">
                      {t('address')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eg: 123 Main St"
                        {...field}
                        className="text-textColor lg:max-w-[360px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="password"
                      className="text-textColor-brand900"
                    >
                      {t('password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={!showPassword ? 'password' : 'text'}
                          placeholder="Enter password"
                          {...field}
                          className="text-textColor lg:max-w-[360px]"
                        />
                        <Button
                          variant="ghost"
                          size={'icon'}
                          type="button"
                          aria-label="Toggle password visibility"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Eye className="h-7 w-7" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="confirmPassword"
                      className="text-textColor-brand900"
                    >
                      {t('confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={!showPassword ? 'password' : 'text'}
                          placeholder="Confirm password"
                          {...field}
                          className="text-textColor lg:max-w-[360px]"
                        />
                        <Button
                          variant="ghost"
                          size={'icon'}
                          type="button"
                          aria-label="Toggle confirm password visibility"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Eye className="h-7 w-7" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-6 flex flex-col gap-y-4 self-stretch">
                <Turnstile
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  size="invisible"
                  execution="execute"
                  onLoad={(_, boundTurnstile) => {
                    turnstileRef.current = boundTurnstile
                    // Run once on load
                    boundTurnstile.execute()
                    // Refresh token every 5 minutes
                    if (tokenRefreshIntervalRef.current) {
                      clearInterval(tokenRefreshIntervalRef.current)
                    }
                    tokenRefreshIntervalRef.current = setInterval(() => {
                      boundTurnstile.reset()
                      boundTurnstile.execute()
                    }, 5 * 60 * 1000)
                  }}
                  onVerify={(token) => {
                    turnstileTokenRef.current = token
                    setTurnstileToken(token)
                    if (
                      retryAfterCaptchaFailRef.current &&
                      pendingSubmissionRef.current
                    ) {
                      const pendingData = pendingSubmissionRef.current
                      retryAfterCaptchaFailRef.current = false
                      pendingSubmissionRef.current = null
                      void onSubmit(pendingData, true)
                    }
                  }}
                  onExpire={() => {
                    turnstileTokenRef.current = ''
                    setTurnstileToken('')
                  }}
                />
                <Button
                  type="submit"
                  className="max-w-60 bg-bgColor-brand900 font-[600] text-textColor-white transition-all hover:scale-105 hover:bg-bgColor-brand600"
                >
                  {t('createAccount')}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Have Account? */}
        <p className="text-sm mb-5">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href="/signIn"
            className="hover:text-textColor-brand/80 text-textColor-brand900 decoration-2 transition-all hover:underline"
          >
            {t('login')}
          </Link>
        </p>

        <p className="mb-6 text-sm text-muted-foreground italic">
          {t('email-delivery-note')} {' '}
          <a href="mailto:tech@vietvibe.org" className="text-textColor-brand900 hover:text-textColor-brand900/80 hover:underline">tech@vietvibe.org</a>.
        </p>
      </div>
    </div>
  )
}

export default SignUpForm
