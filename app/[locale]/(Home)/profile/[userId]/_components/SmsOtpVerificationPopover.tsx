import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import SmsOtpVerificationInput from './SmsOtpVerificationInput'

import React from 'react'

function SmsOtpVerificationPopover() {
  return (
    <div >
      <Popover>
        <PopoverTrigger asChild>
            <Button variant='outline'>Verify</Button>
        </PopoverTrigger>
        <PopoverContent>
            <SmsOtpVerificationInput/>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SmsOtpVerificationPopover
