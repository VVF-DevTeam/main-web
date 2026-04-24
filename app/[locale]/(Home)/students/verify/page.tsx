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

const studentVerificationSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  schoolName: z
    .string()
    .min(2, { message: 'School name must be at least 2 characters' }),
})

type StudentVerificationFormValues = z.infer<typeof studentVerificationSchema>

const StudentVerifyPage = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const isConfirmationMode = Boolean(token && email)

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
      email: '',
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
      const response = await axiosInstance.post('/api/student/verify', data)

      if (response.status === 200) {
        toast.success('Verification email sent successfully', {
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
        const errorMessage =
          error.response?.data?.message || 'Failed to send verification email'
        const statusCode = error.response?.status || 500
        toast.error('Verification email not sent', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {errorMessage} (Status: {statusCode})
            </span>
          ),
          style: {
            color: '#ef4444',
          },
        })
      } else {
        toast.error('Something went wrong', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              Please try again later
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
          email,
        })
        if (response.status === 200) {
          setConfirmSuccess(true)
          toast.success('Student verification completed successfully', {
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
            error.response?.data?.message || 'Student verification failed.'
          )
        } else {
          setConfirmationError(
            'An unexpected error occurred while verifying student status.'
          )
        }
      } finally {
        setConfirmLoading(false)
      }
    }

    void confirmStudentVerification()
  }, [currentDateTime, email, isConfirmationMode, token])

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
                Verify Student
              </h1>
              <p className='text-textColor-brand900'>
                Verify your student status to get discounted prices for all our
                events.
              </p>
            </div>

            {isConfirmationMode ? (
              <div className='space-y-4'>
                {confirmLoading ? (
                  <div className='rounded-lg border border-bgColor-brand900 bg-bgColor-secondary200 p-4 text-center text-sm font-medium text-textColor-brandDark900'>
                    Verifying your student status...
                  </div>
                ) : confirmationError ? (
                  <div className='rounded-lg border border-red-300 bg-red-50 p-4 text-center'>
                    <div className='mb-2 flex items-center justify-center'>
                      <TriangleAlert className='h-5 w-5 text-red-600' />
                    </div>
                    <p className='text-sm font-medium text-red-700'>
                      Verification failed
                    </p>
                    <p className='mt-1 text-xs text-red-700'>{confirmationError}</p>
                  </div>
                ) : confirmSuccess ? (
                  <div className='rounded-lg border border-green-300 bg-green-50 p-4 text-center'>
                    <div className='mb-2 flex items-center justify-center'>
                      <CircleCheck className='h-5 w-5 text-green-600' />
                    </div>
                    <p className='text-sm font-medium text-green-700'>
                      Student status verified successfully
                    </p>
                    <p className='mt-1 text-xs text-green-700'>
                      Your verification is complete. You can now use student
                      pricing where available.
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
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-sm font-semibold text-textColor-brandDark900'>
                          Student email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Enter your school email address'
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
                          School name
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='text'
                            placeholder='Enter your college or university'
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
                      {loading ? 'Sending...' : 'Send verification email'}
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
                    Verification notes
                  </p>
                  <ul className='space-y-1 text-xs text-textColor-brandDark900'>
                    <li>
                      • Student discounts apply to accredited colleges and
                      universities.
                    </li>
                    <li>
                      • We will send you an email for verification.
                    </li>
                    <li>• You may be asked to confirm your active enrollment
                    status.</li>
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
