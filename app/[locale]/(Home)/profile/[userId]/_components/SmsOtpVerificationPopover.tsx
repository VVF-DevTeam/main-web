'use client'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import SmsOtpVerificationInput from './SmsOtpVerificationInput'
import { useEffect, useState } from 'react'
import { usePhoneVerifiedContext } from './PhoneVerifiedContext'
import React from 'react'

type Props = {
  phoneNumber: string
  userId: string
}

function SmsOtpVerificationPopover({ phoneNumber, userId }: Props) {
  const [open, setOpen] = useState(false)
  const { phoneVerified } = usePhoneVerifiedContext()

  useEffect(() => {
    if (phoneVerified) {
      setOpen(false)
    }
  }, [phoneVerified])

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant='outline' onClick={() => setOpen(true)}>Verify</Button>
        </PopoverTrigger>
        <PopoverContent>
            <SmsOtpVerificationInput phoneNumberVerifyNeeded={phoneNumber} userId={userId}/>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SmsOtpVerificationPopover
