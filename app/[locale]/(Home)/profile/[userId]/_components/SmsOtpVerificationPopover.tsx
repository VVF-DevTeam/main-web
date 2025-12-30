'use client'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import SmsOtpVerificationInput from './SmsOtpVerificationInput'
import { useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  phoneNumber: string
  userId: string
}

function SmsOtpVerificationPopover({ phoneNumber, userId }: Props) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('profile')
  const [open, setOpen] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState<string | boolean>(false)

  // if phoneVerified is true, close the popover
  useEffect(() => {
    if (phoneVerified) {
      setOpen(false)
    }
  }, [phoneVerified])

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant='outline' size='sm' onClick={() => setOpen(true)} className='text-textColor-brand900'>{t('verify-phone-number')}</Button>
        </PopoverTrigger>
        <PopoverContent>
            <SmsOtpVerificationInput phoneNumberVerifyNeeded={phoneNumber} userId={userId} open={open} setPhoneVerified={setPhoneVerified}/>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SmsOtpVerificationPopover
