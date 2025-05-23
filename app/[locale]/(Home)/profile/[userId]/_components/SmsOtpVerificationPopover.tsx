import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import SmsOtpVerificationInput from './SmsOtpVerificationInput'

import React from 'react'


type Props = {
  phoneNumber: string;
};

function SmsOtpVerificationPopover({ phoneNumber }: Props) {
  return (
    <div >
      <Popover>
        <PopoverTrigger asChild>
            <Button variant='outline'>Verify</Button>
        </PopoverTrigger>
        <PopoverContent>
            <SmsOtpVerificationInput phoneNumberVerifyNeeded={phoneNumber}/>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SmsOtpVerificationPopover
