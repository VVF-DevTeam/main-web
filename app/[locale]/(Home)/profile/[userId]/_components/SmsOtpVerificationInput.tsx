'use client'

import { auth } from '@/firebase'
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth'
import React, { FormEvent, useEffect, useState, useTransition, useRef } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
// import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

type Props = {
  phoneNumberVerifyNeeded: string;
};

function SmsOtpVerificationInput({ phoneNumberVerifyNeeded }: Props) {
  // const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  // prevent auto web scraping tools
  // const [recaptchaVerifier, setRecaptchaVerifier] =
  //   useState<RecaptchaVerifier | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier>();

  // after send the request for Firebase, we get this confirmationResult back from that
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  // useEffect(() => {
  //   const recaptchaVerifier = new RecaptchaVerifier(
  //     auth,
  //     'recaptcha-container',
  //     {
  //       size: 'invisible',
  //     }
  //   )

  //   setRecaptchaVerifier(recaptchaVerifier)

  //   return () => {
  //     recaptchaVerifier.clear()
  //   }
  // }, [auth])

  useEffect(() => {
    // only initialize once
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth ,
        "recaptcha-container",
        { size: "invisible" },          
      );
      // render it a single time
      recaptchaVerifierRef.current.render().catch(console.error);
    }
    // empty deps → runs only on mount
  }, [auth]);

  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6
    if (hasEnteredAllDigits) {
      verifyOtp()
    }

  }, [otp])

  const verifyOtp = async () => {
    startTransition(async () => {
      setError("")

      if(!confirmationResult) {
        setError("Please request OTP first.")
        return
      }

      try {
        await confirmationResult?.confirm(otp)
      } catch (err) {
        console.log(err)
        setError('Failed to verify OTP. Please check the OTP.')
      }
    })
  }

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setResendCountdown(60)

    startTransition(async () => {
      setError('')

      if (!recaptchaVerifierRef.current) {
        return setError('RecaptchaVerifier is not initialized')
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumberVerifyNeeded,
          recaptchaVerifierRef.current
        )

        // console.log("************ CONFIRMATION RESULT ", confirmationResult)
        setResendCountdown(0)
        setConfirmationResult(confirmationResult)
        setSuccess('OTP sent successfully.')
      } catch (error) {
        // console.log('******************** THIS IS ERROR OTP: ', error)
        setResendCountdown(0)

        if (error.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.')
        } else {
          setError('Failed to send OTP. Please try again.')
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
      {!confirmationResult && (
        <form onSubmit={requestOtp}>
          <Input
            className="text-black"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-400">
            Please enter your phone number with the country code (i.e. +1 for
            US/Canada)
          </p>
        </form>
      )}

      {confirmationResult && (
        <InputOTP maxLength={6} value="otp" onChange={(value) => setOtp(value)}>
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

      <div className="p-10 text-center">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      {isPending && loadingIndicator}
      <div id="recaptcha-container" className='hidden'></div>
    </div>
  )
}

export default SmsOtpVerificationInput
