'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { verifyToken } from '@/lib/actions/token/verifyToken'
import {
  TriangleAlert,
  Lock,
  CircleCheck,
  KeyRound,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import ClipLoader from 'react-spinners/ClipLoader'
import {
  Form,
  FormControl,
  FormMessage,
  FormItem,
  FormField,
  FormLabel,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { changePassword } from '@/lib/actions/auth/changePassword'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import { useTranslation } from 'react-i18next'

type VerifyTokenResponse = {
  message: string
  success: boolean
}

const ResetPasswordClient = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('signIn-signUp')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const currentDateTime = getCurrentDateTime()

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, {
          message:
            t('password-requirements-description-1') ||
            'Password must be at least 8 characters long',
        })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
          message:
            t('password-requirements-description-2') ||
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
      confirmPassword: z
        .string()
        .min(8, {
          message:
            t('password-requirements-description-1') ||
            'Password must be at least 8 characters long',
        })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
          message:
            t('password-requirements-description-2') ||
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwords-dont-match') || "Passwords don't match",
      path: ['confirmPassword'],
    })

  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  })
  const [reviewPassword, setReviewPassword] = useState(false)

  const getVerificationToken = async () => {
    if (!token) {
      setError(t('invalid-token'))
      return
    }

    try {
      const isTokenVerified: VerifyTokenResponse = await verifyToken(token)
      if (!isTokenVerified.success) {
        setError(t('token-verification-failed'))
      }
    } catch (err) {
      console.log(err)
      setError(t('unexpected-error'))
    }
  }

  useEffect(() => {
    getVerificationToken()
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!email) {
      toast.error('Email is required for password reset', {
        description: "Please make sure you're using a valid reset link.",
        style: { color: '#ef4444' },
      })
      return
    }

    try {
      const result = await changePassword({
        email: email,
        newPassword: data.password,
        forgotPassword: true,
      })

      if (result.success) {
        toast.success('Password reset successfully, redirecting to sign in page...', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e',
          },
        })
        setTimeout(() => {
          router.push('/signIn')
        }, 6000)
      } else {
        toast.error('Failed to reset password', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{result.message}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444',
          },
        })
      }
    } catch (err) {
      console.error('Reset password error:', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again later.'
      toast.error(errorMessage, {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#ef4444',
        },
      })
    }
  }

  return (
    <div className="flex-center relative min-h-screen bg-bgColor-secondary400">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob animation-delay-4000 absolute left-40 top-40 h-80 w-80 rounded-full bg-bgColor-secondary900 opacity-20 mix-blend-multiply blur-xl filter"></div>
      </div>

      <div className="relative mx-4 w-full max-w-md">
        {loading ? (
          <div className="border-bg-white/20 rounded-2xl border bg-white/80 p-12 text-center shadow-2xl backdrop-blur-sm">
            <ClipLoader
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
              color="#C54B3E"
            />
            <p className="mt-4 font-medium text-textColor-brand900">
              {t('verifying-token')}
            </p>
          </div>
        ) : (
          <div className="border-bg-white/20 overflow-hidden rounded-2xl border bg-white/80 shadow-2xl backdrop-blur-sm">
            {error ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bgColor-secondary600">
                  <TriangleAlert className="h-8 w-8 text-textColor-brandDark900" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-textColor-brandDark900">
                  {t('verification-failed')}
                </h2>
                <p className="leading-relaxed text-textColor-brand900">{error}</p>
                <div className="mt-6 rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4">
                  <p className="text-sm text-textColor-brandDark900">
                    {t('verification-failed-description')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bgColor-secondary600">
                    <KeyRound className="h-8 w-8 text-textColor-brand900" />
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-textColor-brandDark900">
                    {t('reset-your-password')}
                  </h1>
                  <p className="text-textColor-brand900">
                    {t('reset-your-password-description')}
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900">
                            <Lock className="h-4 w-4 text-textColor-brand900" />
                            {t('new-password')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={reviewPassword ? 'text' : 'password'}
                                placeholder={
                                  t('new-password-placeholder') ||
                                  'Enter your new password'
                                }
                                className="h-12 border-gray-300 transition-colors focus:border-bgColor-brand900 focus:ring-bgColor-brand900 pr-12"
                                {...field}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setReviewPassword(!reviewPassword)}
                              >
                                {reviewPassword ? <EyeOff /> : <Eye />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900">
                            <CircleCheck className="h-4 w-4 text-textColor-brand900" />
                            {t('confirm-password')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={reviewPassword ? 'text' : 'password'}
                                placeholder={
                                  t('confirm-password-placeholder') ||
                                  'Confirm your new password'
                                }
                                className="h-12 border-gray-300 transition-colors focus:border-bgColor-brand900 focus:ring-bgColor-brand900 pr-12"
                                {...field}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setReviewPassword(!reviewPassword)}
                              >
                                {reviewPassword ? <EyeOff /> : <Eye />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-sm" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      variant="default"
                      className="h-12 w-full"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <ClipLoader size={20} color="white" />
                          <span>{t('resetting')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>{t('reset-password')}</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-textColor-brand900" />
                    <div>
                      <p className="mb-1 text-sm font-medium text-textColor-brandDark900">
                        {t('password-requirements')}
                      </p>
                      <ul className="space-y-1 text-xs text-textColor-brand900">
                        <li>• {t('password-requirements-description-1')}</li>
                        <li>• {t('password-requirements-description-2')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordClient

