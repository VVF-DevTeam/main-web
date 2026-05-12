'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
import ProviderButtons, {
  type ProviderButtonsTurnstileHandle,
} from './ProviderButtons'
import { useSession } from 'next-auth/react'
import { ServerActionResponse } from '@/lib/types/serverAction'
import { useTranslation } from 'react-i18next'
import Loader from '@/components/loader/Loader'

const SignInForm = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const router = useRouter()
  const { update: updateSession } = useSession()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const providerTurnstileRef = useRef<ProviderButtonsTurnstileHandle | null>(null)
  const retryAfterCaptchaFailRef = useRef(false)
  const pendingSubmissionRef = useRef<z.infer<typeof signInSchema> | null>(null)
  // If token is resolved by retry flow, prevent the original waiting submit
  // from continuing so we avoid duplicate submissions.
  const tokenResolvedViaRetryRef = useRef(false)

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

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const refreshTurnstileToken = () => {
    providerTurnstileRef.current?.refresh()
  }

  const onSubmit = async (
    data: z.infer<typeof signInSchema>,
    hasRetried = false
  ) => {
    try {
      setLoading(true)

      const turnstile = providerTurnstileRef.current
      if (!turnstile) {
        toast.error(
          'Could not connect to the server because of time out, please refresh the page and try again.',
          {
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          }
        )
        return
      }

      // If token isn't ready yet, wait for Turnstile verification.
      // No toast: UX is "show Loader briefly, then stop if timeout".
      if (!turnstile.getToken()) {
        try {
          await turnstile.waitForToken(10000)
        } catch {
          toast.error(
            'Could not connect to the server because of time out, please refresh the page and try again.',
            {
              description: (
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              ),
              style: {
                color: '#ef4444', // red-500 color
              },
            }
          )
          return
        }
      }

      // If token was marked as "resolved by retry flow", clear the marker immediately.
      // Only suppress the original waiting submit path. Retried path must continue.
      if (tokenResolvedViaRetryRef.current) {
        tokenResolvedViaRetryRef.current = false
        if (!hasRetried) return
      }

      const response: ServerActionResponse = await signinAction({
        ...data,
        locale: locale,
        turnstileToken: turnstile.getToken(),
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
        await updateSession()
        router.replace(`/${locale}`)
        router.refresh()
      } else {
        if (!hasRetried) {
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-bgColor-brand900 font-[600] text-textColor-white transition-all hover:scale-105 hover:bg-bgColor-brand900/80"
                >
                  {t('login')}
                </Button>
                {/* <p className="text-center text-sm font-bold">OR</p> */}
                <ProviderButtons
                  ref={providerTurnstileRef}
                  credentialTurnstileBridge={{
                    retryAfterCaptchaFailRef,
                    pendingSubmissionRef,
                    tokenResolvedViaRetryRef,
                    onRetrySubmit: (data, hasRetried) =>
                      void onSubmit(
                        data as z.infer<typeof signInSchema>,
                        hasRetried
                      ),
                  }}
                />
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
