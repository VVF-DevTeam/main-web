'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { useParams } from 'next/navigation'
import { signinAction } from '@/lib/actions/auth/signinAction'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import CustomIcon from '@/components/icon/CustomIcon'
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
import { signInSchema } from '@/lib/zodSchema/signinSchema'
import { redirect } from 'next/navigation'
import ProviderButtons from './ProviderButtons'
import { useSearchParams } from 'next/navigation'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { useTranslation } from 'react-i18next'
import Turnstile, { type BoundTurnstileObject } from 'react-turnstile'
import Loader from '@/components/loader/Loader'

const SignInForm = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [showPassword, setShowPassword] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)
  const turnstileRef = useRef<BoundTurnstileObject | null>(null)
  const turnstileTokenRef = useRef('')
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryAfterCaptchaFailRef = useRef(false)
  const pendingSubmissionRef = useRef<z.infer<typeof signInSchema> | null>(null)
  /**
   * Turnstile token arrives asynchronously. Early submit shows Loader briefly; we keep the
   * timeout id in a ref to cancel it when a real sign-in runs or when the component unmounts,
   * so we never flip `loading` false at the wrong time or after unmount.
   */
  const captchaWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const searchParams = useSearchParams()
  const currentDateTime = getCurrentDateTime()

  useEffect(() => {
    // Retrieve the 'message' parameter from the URL query string
    const message = searchParams.get('message') || ''

    // Check if the message is 'sign-in-required'
    if (message === 'sign-in-required') {
      toast.info('Sign In Required', {
        description: (
          <div className="flex flex-col gap-1">
            <span>You need to sign in to access the requested page</span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // green-500 color
        },
      })
    }
  }, [searchParams])

  useEffect(() => {
    // Redirect to home page if the user is already logged in
    if (!shouldRedirect) {
      return
    }
    redirect('/')
  }, [shouldRedirect])

  // Cleanup Turnstile refresh interval and captcha-wait timeout on unmount
  useEffect(() => {
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
      if (captchaWaitTimeoutRef.current) {
        clearTimeout(captchaWaitTimeoutRef.current)
      }
    }
  }, [])

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const isCaptchaFailure = (message: string) =>
    message.toLowerCase().includes('captcha verification')

  const refreshTurnstileToken = () => {
    if (!turnstileRef.current) return
    turnstileRef.current.reset()
    turnstileRef.current.execute()
  }

  const onSubmit = async (
    data: z.infer<typeof signInSchema>,
    hasRetried = false
  ) => {
    // No token yet: show Loader (see `{loading && <Loader />}`) for a fixed duration.
    // Early return means `finally` is skipped — the timeout must reset `loading`.
    if (!turnstileToken) {
      if (captchaWaitTimeoutRef.current) {
        clearTimeout(captchaWaitTimeoutRef.current)
      }
      setLoading(true)
      captchaWaitTimeoutRef.current = setTimeout(() => {
        captchaWaitTimeoutRef.current = null
        setLoading(false)
      }, 2000)
      return
    }

    // Token present: cancel any pending wait timer so it cannot unset `loading` mid-request.
    if (captchaWaitTimeoutRef.current) {
      clearTimeout(captchaWaitTimeoutRef.current)
      captchaWaitTimeoutRef.current = null
    }

    try {
      setLoading(true)
      const response: ServerActionResponse = await signinAction({
        ...data,
        locale: locale,
        turnstileToken,
      })

      if (response.success) {
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
        setShouldRedirect(true)
      } else {
        if (!hasRetried && isCaptchaFailure(response.message)) {
          pendingSubmissionRef.current = data
          retryAfterCaptchaFailRef.current = true
          refreshTurnstileToken()
          return
        }
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
        // Rotate token for any failed login response
        refreshTurnstileToken()
      }
    } catch (error) {
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
      // Rotate token when unexpected errors happen too
      refreshTurnstileToken()
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (data: z.infer<typeof signInSchema>) => {
    await onSubmit(data, false)
  }

  return (
    <>
      {/* Sign-in in progress, or 2s captcha-not-ready feedback (see onSubmit) */}
      {loading && <Loader />}
      <div className="mt-8 flex w-full flex-col px-6 py-4 md:py-12 lg:px-14 xl:px-20">
        {/* Form Header */}
        <div className="flex-center header-font-black mb-8 gap-x-4 md:mb-16 lg:mb-28">
          {/* Small screens: smaller icon */}
          <div className="block md:hidden">
            <CustomIcon height={72} width={72} />
          </div>
          {/* Medium and above: larger icon */}
          <div className="hidden md:block">
            <CustomIcon height={100} width={100} />
          </div>
          <h1 className="text-2xl md:text-3xl">Viet Vibe Foundation</h1>
        </div>
        <h1 className="header-font-default text-4xl font-semibold text-textColor-brand900">
          {t('login')}
        </h1>
        <p className="mt-8 text-base text-muted-foreground">
          {t('description-signIn')}
        </p>
        <Separator className="my-4 h-[1px] w-full bg-gray-300" />

        {/* Form */}
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="default-gap mt-4 flex flex-col pb-6"
            >
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="header-font-default text-lg text-textColor-brand900">
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

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="password"
                      className="header-font-default text-lg text-textColor-brand900"
                    >
                      {t('password')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative lg:max-w-[360px]">
                        <Input
                          type={showPassword ? 'text' : 'password'}
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

              {/* Submit & Other Actions */}
              <div className="flex-center mt-2 flex-col gap-y-4 self-stretch">
                <Link
                  href="/forgotPassword"
                  className="place-self-end text-sm text-textColor-brand900 hover:text-textColor-brand900/80 hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
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
                  className="w-full bg-bgColor-brand900 font-[600] text-textColor-white transition-all hover:scale-105 hover:bg-bgColor-brand900/80"
                >
                  {t('login')}
                </Button>
                {/* <p className="text-center text-sm font-bold">OR</p> */}
                <ProviderButtons />
                <p className="text-sm font-bold">OR</p>
                <p className="text-sm">
                  {t('noAccount')}{' '}
                  <Link
                    href="/signUp"
                    className="hover:text-textColor-brand/70 text-textColor-brand900 decoration-2 transition-all hover:underline"
                  >
                    {t('signUp')}
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}

export default SignInForm
