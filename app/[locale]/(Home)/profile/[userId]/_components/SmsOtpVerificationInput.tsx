'use client'

// NOTE: Please change from localhost to 127.0.0.1:3000 to test the recaptcha
import { auth } from '@/firebase'
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import React, { FormEvent, useEffect, useState, useTransition } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'
import { usePhoneVerifiedContext } from './PhoneVerifiedContext'

type Props = {
  phoneNumberVerifyNeeded: string
  userId: string
}

function SmsOtpVerificationInput({ phoneNumberVerifyNeeded, userId }: Props) {
  // const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [regionCode, setRegionCode] = useState('canada') // default to Canada
  const [otpEntered, setOtpEntered] = useState(false)
  // prevent auto web scraping tools
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null)
  // const recaptchaVerifierRef = useRef<RecaptchaVerifier>();

  // after send the request for Firebase, we get this confirmationResult back from that
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  const [isPending, startTransition] = useTransition()

  const { setPhoneVerified } = usePhoneVerifiedContext()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA resolved successfully')
        },
      }
    )

    // Render the recaptcha widget
    recaptchaVerifier
      .render()
      .then((widgetId) => {
        console.log('reCAPTCHA widget rendered:', widgetId)
      })
      .catch(console.error)

    setRecaptchaVerifier(recaptchaVerifier)

    return () => {
      recaptchaVerifier.clear()
    }
  }, [auth])

  // useEffect(() => {
  //   // only initialize once
  //   if (!recaptchaVerifierRef.current) {
  //     recaptchaVerifierRef.current = new RecaptchaVerifier(
  //       auth ,
  //       "recaptcha-container",
  //       { size: "invisible" },
  //     );
  //     // render it a single time
  //     recaptchaVerifierRef.current.render().catch(console.error);
  //   }
  //   // empty deps → runs only on mount
  // }, [auth]);
  const updatePhoneVerifiedInDB = async (value: boolean) => {
    await fetch('/api/users/phone-verified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneVerified: value }),
    })
  }

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6
    if (hasEnteredAllDigits) {
      setOtpEntered(true)
    }
  }, [otp])

  const verifyOtp = async () => {
    startTransition(async () => {
      setError('')

      if (!confirmationResult) {
        setError('Please request OTP first.')
        return
      }

      try {
        await confirmationResult?.confirm(otp)
        setSuccess('OTP verified successfully.')
        setPhoneVerified(true)
        await updatePhoneVerifiedInDB(true)
      } catch (err) {
        console.log(err)
        setError('Failed to verify OTP. Please check the OTP.')
        await updatePhoneVerifiedInDB(false)
      }
    })
  }

  const formatPhoneNumberWithRegionCode = (phone: string) => {
    try {
      if (regionCode === 'canada') {
        console.log('Formatting phone number for Canada:', phone)
        return `+1${phone}` // Canada uses +1
      } else if (regionCode === 'vietnam') {
        console.log('Formatting phone number for Vietnam:', phone)
        // Remove leading zero if present
        if (phone.startsWith('0')) {
          phone = phone.substring(1)
        }
        return `+84${phone}` // Vietnam uses +84
      }
    } catch (error) {
      console.error('Error formatting phone number:', error)
    }
  }

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setResendCountdown(60)

    startTransition(async () => {
      setError('')

      if (!recaptchaVerifier) {
        // or recaptchaVerifierRef.current
        return setError('RecaptchaVerifier is not initialized')
      }
      const formattedPhoneNumber = formatPhoneNumberWithRegionCode(
        phoneNumberVerifyNeeded
      )

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhoneNumber || '',
          recaptchaVerifier // or recaptchaVerifierRef.current
        )
        // setResendCountdown(0)
        setConfirmationResult(confirmationResult)
        setSuccess('OTP sent successfully.')
      } catch (error) {
        setResendCountdown(0)

        if (error.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. Please check and try again.')
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.')
        } else {
          setError('Failed to send OTP. Please try again later or contact IT team for support.')
        }
      }
    })
  }

  const loadingIndicator = (
    <div role="status" className="flex justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <radialGradient
          id="a11"
          cx=".66"
          fx=".66"
          cy=".3125"
          fy=".3125"
          gradientTransform="scale(1.5)"
        >
          <stop offset="0" stopColor="#EFBAA4"></stop>
          <stop offset=".3" stopColor="#EFBAA4" stopOpacity=".9"></stop>
          <stop offset=".6" stopColor="#EFBAA4" stopOpacity=".6"></stop>
          <stop offset=".8" stopColor="#EFBAA4" stopOpacity=".3"></stop>
          <stop offset="1" stopColor="#EFBAA4" stopOpacity="0"></stop>
        </radialGradient>
        <circle
          transform-origin="center"
          fill="none"
          stroke="url(#a11)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray="200 1000"
          strokeDashoffset="0"
          cx="100"
          cy="100"
          r="70"
        >
          <animateTransform
            type="rotate"
            attributeName="transform"
            calcMode="spline"
            dur="2"
            values="360;0"
            keyTimes="0;1"
            keySplines="0 0 1 1"
            repeatCount="indefinite"
          ></animateTransform>
        </circle>
        <circle
          transform-origin="center"
          fill="none"
          opacity=".2"
          stroke="#EFBAA4"
          strokeWidth="15"
          strokeLinecap="round"
          cx="100"
          cy="100"
          r="70"
        ></circle>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )

  return (
    <div className="justify-center">
      {/* Select Country Region Code */}
      <Select value={regionCode} onValueChange={setRegionCode}>
        <SelectTrigger>
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Region Code</SelectLabel>
            <SelectItem value="canada">Canada (+1)</SelectItem>
            <SelectItem value="vietnam">Vietnam (+84)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <br />

      {confirmationResult && (
        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      )}

      <Button
        disabled={isPending || resendCountdown > 0}
        onClick={() => requestOtp()}
        className="mx-auto mt-5 block"
      >
        {resendCountdown > 0
          ? `Resend OTP in ${resendCountdown}`
          : isPending
            ? 'Sending OTP'
            : 'Send OTP'}
      </Button>

      <br />
      <Button
        disabled={!otpEntered || isPending}
        onClick={verifyOtp}
        className="mx-auto mt-5 block"
      >
        {isPending ? 'Verifying OTP...' : 'Verify OTP'}
      </Button>

      {/* Display error or success messages */}
      <div className="p-10 text-center">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      {isPending && loadingIndicator}
      <div id="recaptcha-container" hidden />
    </div>
  )
}

export default SmsOtpVerificationInput
