'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { zodResolver } from '@hookform/resolvers/zod'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { Info, KeyRound } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import Loader from '@/components/loader/Loader'
import Turnstile, { type BoundTurnstileObject } from 'react-turnstile'

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordClient = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const currentDateTime = getCurrentDateTime()
  const [countDown, setCountDown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const turnstileRef = useRef<BoundTurnstileObject | null>(null)
  const turnstileTokenRef = useRef('')
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryAfterCaptchaFailRef = useRef(false)
  const pendingSubmissionRef = useRef<ForgotPasswordFormValues | null>(null)
  /**
   * Promise-based waiting for Turnstile token verification.
   * If the user submits before `onVerify(token)` runs, we show Loader and wait
   * up to 2 seconds before calling the API.
   */
  const tokenWaitResolveRef = useRef<((token: string) => void) | null>(null)
  const tokenWaitRejectRef = useRef<((err: unknown) => void) | null>(null)
  // If token is resolved by retry flow, prevent the original waiting submit
  // from continuing so we avoid duplicate submissions.
  const tokenResolvedViaRetryRef = useRef(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  // Cleanup timers on unmount (avoid intervals/timeouts firing after this component is gone)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
      tokenWaitResolveRef.current = null
      tokenWaitRejectRef.current = null
    }
  }, [])

  const isCaptchaFailure = (message: string) =>
    message.toLowerCase().includes('captcha verification')

  const refreshTurnstileToken = () => {
    if (!turnstileRef.current) return
    // Clear token immediately so the next submit waits for a fresh `onVerify`.
    turnstileTokenRef.current = ''
    setTurnstileToken('')
    turnstileRef.current.reset()
    turnstileRef.current.execute()
  }

  const waitForTurnstileToken = (ms = 10000) => {
    if (turnstileTokenRef.current) {
      return Promise.resolve(turnstileTokenRef.current)
    }

    // Prevent hanging if a new submit starts a new wait.
    if (tokenWaitRejectRef.current) {
      tokenWaitRejectRef.current(
        new Error('Superseded by a newer token wait')
      )
    }

    return new Promise<string>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        reject(new Error('Turnstile token timeout'))
      }, ms)

      tokenWaitResolveRef.current = (token) => {
        window.clearTimeout(timeoutId)
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        resolve(token)
      }

      tokenWaitRejectRef.current = (err) => {
        window.clearTimeout(timeoutId)
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        reject(err)
      }
    })
  }

  // Submit email to reset password
  const onSubmitEmail = async (
    data: ForgotPasswordFormValues,
    hasRetried = false
  ) => {
    try {
      setLoading(true)
      // If token isn't ready yet, show Loader and wait (max 2s) for Turnstile.
      if (!turnstileTokenRef.current) {
        try {
          await waitForTurnstileToken(10000)
        } catch {
          setLoading(false)
          toast.error(
            'Could not connect to the server, please refresh the page and try again.',
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

      // If token resolved via retry flow, suppress only the original submit path.
      if (!hasRetried && tokenResolvedViaRetryRef.current) {
        tokenResolvedViaRetryRef.current = false
        return
      }

      const response = await axiosInstance.post('/api/auth/forgotPassword', {
        email: data.email,
        turnstileToken: turnstileTokenRef.current,
      })
      if (response.status === 200) {
        toast.success('Verification email sent successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        })

        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        setCountDown(60)
        timerRef.current = setInterval(() => {
          setCountDown((prevCount) => {
            if (prevCount <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
              }
              return 0
            }
            return prevCount - 1
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Error:', error)
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || 'Failed to send reset email'
        const statusCode = error.response?.status || 500

        if (!hasRetried) {
          pendingSubmissionRef.current = data
          retryAfterCaptchaFailRef.current = true
          refreshTurnstileToken()
          return
        }

        toast.error('Verification email not sent', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {errorMessage} (Status: {statusCode})
            </span>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
        // Rotate token for any failed forgot-password response
        refreshTurnstileToken()
      } else {
        toast.error('Something went wrong', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              Please try again later
            </span>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
        refreshTurnstileToken()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (data: ForgotPasswordFormValues) => {
    await onSubmitEmail(data, false)
  }

  return (
    <>
      {/* Forgot-password request or brief captcha-not-ready overlay (see onSubmitEmail) */}
      {loading && <Loader />}
      <div className="flex-center relative min-h-screen bg-bgColor-secondary400">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-blob animation-delay-4000 absolute left-40 top-40 h-80 w-80 rounded-full bg-bgColor-secondary900 opacity-20 mix-blend-multiply blur-xl filter"></div>
        </div>

        <div className="relative mx-4 w-full max-w-md">
          <div className="border-bg-white/20 overflow-hidden rounded-2xl border bg-white/80 shadow-2xl backdrop-blur-sm">
            <div className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bgColor-secondary600">
                <KeyRound className="mx-auto h-8 w-8 text-textColor-brandDark900" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-textColor-brandDark900">
                {t('forgotPassword')}
              </h1>
              <p className="text-textColor-brand900">
                {t('forgotPassword-description')}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900">
                        {t('email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={
                            t('enter-email-address') || 'Enter email address'
                          }
                          className="h-12 border-gray-300 transition-colors focus:border-bgColor-brand900 focus:ring-bgColor-brand900"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
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
                    const isRetryFlow =
                      retryAfterCaptchaFailRef.current &&
                      pendingSubmissionRef.current
                    tokenResolvedViaRetryRef.current = Boolean(isRetryFlow)
                    if (tokenWaitResolveRef.current) {
                      tokenWaitResolveRef.current(token)
                    }
                    if (
                      retryAfterCaptchaFailRef.current &&
                      pendingSubmissionRef.current
                    ) {
                      const pendingData = pendingSubmissionRef.current
                      retryAfterCaptchaFailRef.current = false
                      pendingSubmissionRef.current = null
                      void onSubmitEmail(pendingData, true)
                    }
                  }}
                  onExpire={() => {
                    turnstileTokenRef.current = ''
                    setTurnstileToken('')
                    if (tokenWaitRejectRef.current) {
                      tokenWaitRejectRef.current(new Error('Turnstile expired'))
                    }
                  }}
                />

                <Button
                  type="submit"
                  disabled={countDown > 0 || loading}
                  variant="default"
                  className="h-12 w-full"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      {loading ? t('sending') : t('send-reset-email')}
                    </span>
                    {countDown > 0 && !loading && <span>({countDown})</span>}
                  </div>
                </Button>
              </form>
            </Form>

            <div className="mt-6 rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-textColor-brandDark900" />
                <div>
                  <p className="mb-1 text-sm font-medium text-textColor-brandDark900">
                    {t('reset-instructions-title')}
                  </p>
                  <ul className="space-y-1 text-xs text-textColor-brandDark900">
                    <li>• {t('reset-instructions-description')}</li>
                    <li>• {t('reset-instructions-description-2')}</li>
                    <li>• {t('reset-instructions-description-3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default ForgotPasswordClient
