'use client'

// NOTE: Please change from localhost to 127.0.0.1:3000 to test the recaptcha
import { auth } from '@/firebase'
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import React, { FormEvent, useEffect, useState, useRef } from 'react'
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
import { useRouter } from 'next/navigation'

type Props = {
  phoneNumberVerifyNeeded: string
  userId: string
  open: boolean
  setPhoneVerified: (value: boolean) => void
}

function SmsOtpVerificationInput({
  phoneNumberVerifyNeeded,
  userId,
  open,
  setPhoneVerified,
}: Props) {
  const router = useRouter()
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

  const [isPending, setIsPending] = useState(false)

  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  // Initialize the recaptcha verifier and check if open is closed, then clear recaptcha verifier
  useEffect(() => {
    if (!open) return

    // Generate a unique ID
    const recaptchaId = `recaptcha-container-${Date.now()}`

    // Create the container in the base of the document because the widget does not need to be in the pop over
    const container = document.createElement('div')
    container.id = recaptchaId
    container.hidden = true
    document.body.appendChild(container)

    // Create the verifier
    const verifier = new RecaptchaVerifier(auth, recaptchaId, {
      size: 'invisible',
      defaultCountry: 'VN',
      callback: () => {
        console.log('reCAPTCHA resolved successfully')
      },
    })

    verifier
      .render()
      .then((widgetId) => {
        console.log('reCAPTCHA widget rendered:', widgetId)
      })
      .catch(console.error)

    setRecaptchaVerifier(verifier)

    return () => {
      verifier.clear()
      // Remove the container from the DOM
      const el = document.getElementById(recaptchaId)
      if (el) el.remove()
    }
  }, [auth, open])

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
    setIsPending(true)
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
      router.refresh()
    } catch (err) {
      console.log(err)
      setError('Failed to verify OTP. Please check the OTP.')
      await updatePhoneVerifiedInDB(false)
    }
    setIsPending(false)
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

    setIsPending(true)
    setError('')

    if (!recaptchaVerifier) {
      // or recaptchaVerifierRef.current
      return setError('RecaptchaVerifier is not initialized')
    }
    const formattedPhoneNumber = phoneNumberVerifyNeeded.startsWith('+')
      ? phoneNumberVerifyNeeded
      : formatPhoneNumberWithRegionCode(phoneNumberVerifyNeeded)

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
        console.log(error)
        setError(
          'Failed to send OTP. Please try again later or contact IT team for support.'
        )
      }
    }
    setIsPending(false)
  }

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = setTimeout(() => setSuccess(''), 3000)
    }
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    }
  }, [success])

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
      <div className="p-4 flex flex-col items-center min-h-[48px]">
        {error && (
          <div className="flex items-center gap-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow animate-shake">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow animate-fade-in">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>{success}</span>
          </div>
        )}
      </div>

      {isPending && loadingIndicator}
    </div>
  )
}

export default SmsOtpVerificationInput
