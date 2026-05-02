'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
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
import { BadgeCheck, GraduationCap, Info, TriangleAlert, CircleCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'

const INVALID_EDU_EMAIL_MESSAGE =
  'We cannot verify that your edu email is valid, please contact VVF technical team at tech@vietvibe.org, we will reply to you in 24hrs.'

type StudentVerificationFormValues = {
  eduEmail: string
  schoolName: string
}

const StudentVerifyPage = () => {
  const useTranslationAny = useTranslation as any
  const { t } = useTranslationAny('students')
  const ts = (key: string, options?: Record<string, string | number>) =>
    String((t as any)(key, options))
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const isConfirmationMode = Boolean(token)
  const { update: updateSession } = useSession()
  const invalidEduEmailDisplayMessage = ts('verifyPage.errors.invalidEduEmail')
  const studentVerificationSchema: z.ZodType<StudentVerificationFormValues> = React.useMemo(
    () =>
      z.object({
        eduEmail: z.string().email({ message: ts('verifyPage.form.validation.invalidEmail') }),
        schoolName: z.string().min(2, { message: ts('verifyPage.form.validation.schoolNameMin') }),
      }),
    [ts]
  )

  const currentDateTime = getCurrentDateTime()
  const [countDown, setCountDown] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [confirmLoading, setConfirmLoading] = React.useState(false)
  const [confirmationError, setConfirmationError] = React.useState<string | null>(
    null
  )
  const [confirmSuccess, setConfirmSuccess] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const form = useForm<StudentVerificationFormValues>({
    resolver: zodResolver(studentVerificationSchema),
    defaultValues: {
      eduEmail: '',
      schoolName: '',
    },
  })

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const onSubmitVerification = async (data: StudentVerificationFormValues) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/student/verify', {
        eduEmail: data.eduEmail,
        schoolName: data.schoolName,
      })

      if (response.status === 200) {
        toast.success(t('verifyPage.toasts.verificationEmailSentTitle'), {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e',
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
        const backendErrorMessage = error.response?.data?.message
        if (backendErrorMessage === INVALID_EDU_EMAIL_MESSAGE) {
          toast.error(invalidEduEmailDisplayMessage, {
            style: {
              color: '#ef4444',
            },
          })
          return
        }

        const errorMessage =
          error.response?.data?.message || ts('verifyPage.errors.failedToSendVerificationEmail')
        const statusCode = error.response?.status || 500
        toast.error(t('verifyPage.toasts.verificationEmailNotSentTitle'), {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {ts('verifyPage.toasts.errorWithStatus', {
                message: errorMessage,
                statusCode,
              })}
            </span>
          ),
          style: {
            color: '#ef4444',
          },
        })
      } else {
        toast.error(t('verifyPage.toasts.genericErrorTitle'), {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {t('verifyPage.toasts.tryAgainLater')}
            </span>
          ),
          style: {
            color: '#ef4444',
          },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const confirmStudentVerification = async () => {
      if (!isConfirmationMode) return
      setConfirmLoading(true)
      setConfirmationError(null)
      setConfirmSuccess(false)

      try {
        const response = await axiosInstance.post('/api/student/verify/confirm', {
          token,
        })
        if (response.status === 200) {
          await updateSession()
          setConfirmSuccess(true)
          toast.success(t('verifyPage.toasts.confirmationSuccessTitle'), {
            description: (
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            ),
            style: {
              color: '#22c55e',
            },
          })
        }
      } catch (error) {
        if (isAxiosError(error)) {
          setConfirmationError(
            error.response?.data?.message || ts('verifyPage.errors.verificationFailed')
          )
        } else {
          setConfirmationError(
            ts('verifyPage.errors.unexpectedVerificationError')
          )
        }
      } finally {
        setConfirmLoading(false)
      }
    }

    void confirmStudentVerification()
  }, [currentDateTime, isConfirmationMode, token])

  return (
    <div className='flex-center relative min-h-[calc(100vh+120px)] content-center bg-bgColor-white'>
      {loading && <Loader />}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='animate-blob animation-delay-4000 absolute left-40 top-40 h-80 w-80 rounded-full bg-bgColor-secondary900 opacity-20 mix-blend-multiply blur-xl filter'></div>
      </div>

      <div className='relative mx-4 w-full max-w-md'>
        <div className='overflow-hidden rounded-2xl border border-bgColor-white/20 bg-white/80 shadow-2xl backdrop-blur-sm'>
          <div className='p-8'>
            <div className='mb-8 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bgColor-secondary600'>
                <GraduationCap className='mx-auto h-8 w-8 text-textColor-brandDark900' />
              </div>
              <h1 className='mb-2 text-2xl font-bold text-textColor-brandDark900'>
                {t('verifyPage.title')}
              </h1>
              <p className='text-textColor-brand900'>
                {t('verifyPage.description')}
              </p>
            </div>

            {isConfirmationMode ? (
              <div className='space-y-4'>
                {confirmLoading ? (
                  <div className='rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4 text-center text-sm font-medium text-textColor-brandDark900'>
                    {t('verifyPage.status.verifying')}
                  </div>
                ) : confirmationError ? (
                  <div className='rounded-lg border border-red-300 bg-red-50 p-4 text-center'>
                    <div className='mb-2 flex items-center justify-center'>
                      <TriangleAlert className='h-5 w-5 text-red-600' />
                    </div>
                    <p className='text-sm font-medium text-red-700'>
                      {t('verifyPage.status.verificationFailedTitle')}
                    </p>
                    <p className='mt-1 text-xs text-red-700'>{confirmationError}</p>
                  </div>
                ) : confirmSuccess ? (
                  <div className='rounded-lg border border-green-300 bg-green-50 p-4 text-center'>
                    <div className='mb-2 flex items-center justify-center'>
                      <CircleCheck className='h-5 w-5 text-green-600' />
                    </div>
                    <p className='text-sm font-medium text-green-700'>
                      {t('verifyPage.status.verificationSuccessTitle')}
                    </p>
                    <p className='mt-1 text-xs text-green-700'>
                      {t('verifyPage.status.verificationSuccessDescription')}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitVerification)}
                  className='space-y-6'
                >
                  <FormField
                    control={form.control}
                    name='eduEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900'>
                          {t('verifyPage.form.eduEmailLabel')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder={ts('verifyPage.form.eduEmailPlaceholder')}
                            className='h-12 border-gray-300 transition-colors focus:border-bgColor-brand900 focus:ring-bgColor-brand900'
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage className='text-sm' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='schoolName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900'>
                          {t('verifyPage.form.schoolNameLabel')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='text'
                            placeholder={ts('verifyPage.form.schoolNamePlaceholder')}
                            className='h-12 border-gray-300 transition-colors focus:border-bgColor-brand900 focus:ring-bgColor-brand900'
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage className='text-sm' />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    disabled={countDown > 0 || loading}
                    variant='default'
                    className='h-12 w-full'
                  >
                    <span className='flex items-center justify-center gap-2'>
                      <BadgeCheck className='h-4 w-4' />
                      {loading
                        ? t('verifyPage.form.sendingButton')
                        : t('verifyPage.form.sendVerificationButton')}
                      {countDown > 0 && !loading && <span>({countDown})</span>}
                    </span>
                  </Button>
                </form>
              </Form>
            )}

            <div className='mt-6 rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4'>
              <div className='flex items-start gap-3'>
                <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-textColor-brandDark900' />
                <div>
                  <p className='mb-1 text-sm font-medium text-textColor-brandDark900'>
                    {t('verifyPage.notes.title')}
                  </p>
                  <ul className='space-y-1 text-xs text-textColor-brandDark900'>
                    <li>
                      {t('verifyPage.notes.item1')}
                    </li>
                    <li>
                      {t('verifyPage.notes.item2')}
                    </li>
                    <li>{t('verifyPage.notes.item3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentVerifyPage
