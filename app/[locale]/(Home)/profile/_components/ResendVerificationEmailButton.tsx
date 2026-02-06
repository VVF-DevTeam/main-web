'use client'

import { Button } from '@/components/ui/button'
import { resendVerificationEmailAction } from '@/lib/actions/auth/resendVerificationEmail'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type Props = {
  email: string
}

function ResendVerificationEmailButton({ email }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('profile')

  const handleResend = async () => {
    setIsLoading(true)
    try {
      const result = await resendVerificationEmailAction(email)
      
      if (result.success) {
        toast.success(t('verification-email-sent'))
        // Start 60 second countdown
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      toast.error(t('verification-email-error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={isLoading || countdown > 0}
      className='text-textColor-brand900'
    >
      {isLoading
        ? t('resending')
        : countdown > 0
        ? t('resend-countdown', { count: countdown })
        : t('resend-verification-email')}
    </Button>
  )
}

export default ResendVerificationEmailButton

