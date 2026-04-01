'use client'
import React, { useEffect, useRef, useState } from 'react'
import { authAction } from '@/lib/actions/auth/authAction'
import { authType } from '@/lib/types/authTpes'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'
import Turnstile, { type BoundTurnstileObject } from 'react-turnstile'
import { toast } from 'sonner'
import Loader from '@/components/loader/Loader'

const providers: { id: authType; icon: React.ReactNode }[] = [
  { id: 'google', icon: <FcGoogle className="h-6 w-6" /> },
  {
    id: 'facebook',
    icon: (
      <Image
        src="/icons/facebook-colored-icon.ico"
        alt="Facebook"
        width={24}
        height={24}
        unoptimized
      />
    ),
  },
  { id: 'github', icon: <FaGithub className="h-6 w-6" /> },
]

const ProviderButtons = () => {
  const [isVerifying, setIsVerifying] = useState(false)
  const turnstileRef = useRef<BoundTurnstileObject | null>(null)
  const turnstileTokenRef = useRef('')
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryAfterCaptchaFailRef = useRef(false)
  const pendingProviderRef = useRef<authType | null>(null)
  /**
   * Invisible Turnstile fills `turnstileTokenRef` in `onVerify`, which may lag behind the
   * user's first click. If they click a provider before the token exists, we show Loader and
   * re-enable buttons after 2s instead of a toast.
   *
   * Stored in a ref so we can cancel/replace the timer (double-clicks, or starting OAuth
   * once the token arrives) and clear it on unmount.
   */
  const captchaWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
      if (captchaWaitTimeoutRef.current) {
        clearTimeout(captchaWaitTimeoutRef.current)
      }
    }
  }, [])

  const isCaptchaFailure = (message: string) =>
    message.toLowerCase().includes('captcha verification failed')

  const refreshTurnstileToken = () => {
    if (!turnstileRef.current) return
    turnstileRef.current.reset()
    turnstileRef.current.execute()
  }

  const onSubmit = async (provider: authType, hasRetried = false) => {
    try {
      // Pre-token click: Loader + disabled buttons; `finally` will not run because we return
      // before `await`, so the timeout must clear `isVerifying`.
      if (!turnstileTokenRef.current) {
        if (captchaWaitTimeoutRef.current) {
          clearTimeout(captchaWaitTimeoutRef.current)
        }
        setIsVerifying(true)
        captchaWaitTimeoutRef.current = setTimeout(() => {
          captchaWaitTimeoutRef.current = null
          setIsVerifying(false)
        }, 2000)
        return
      }
      // Real OAuth attempt: cancel any scheduled "wait" callback so it cannot set
      // isVerifying false while `authAction` is still running.
      if (captchaWaitTimeoutRef.current) {
        clearTimeout(captchaWaitTimeoutRef.current)
        captchaWaitTimeoutRef.current = null
      }
      setIsVerifying(true)
      await authAction(provider, turnstileTokenRef.current)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      if (!hasRetried && isCaptchaFailure(errorMessage)) {
        pendingProviderRef.current = provider
        retryAfterCaptchaFailRef.current = true
        refreshTurnstileToken()
        return
      }
      // Rotate token for any provider auth failure
      refreshTurnstileToken()
      toast.error('Captcha verification failed')
      console.log(error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerified = (token: string) => {
    turnstileTokenRef.current = token
    if (retryAfterCaptchaFailRef.current && pendingProviderRef.current) {
      const provider = pendingProviderRef.current
      retryAfterCaptchaFailRef.current = false
      pendingProviderRef.current = null
      void onSubmit(provider, true)
    }
  }

  const handleExpired = () => {
    turnstileTokenRef.current = ''
  }

  return (
    <>
      {/* Covers both the 2s “wait for Turnstile” state and the in-flight OAuth redirect */}
      {isVerifying && <Loader />}
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        size="invisible"
        execution="execute"
        onLoad={(_, boundTurnstile) => {
          turnstileRef.current = boundTurnstile
          // Run once on load
          boundTurnstile.execute()
          // Refresh token every 5 minutes
          if (tokenRefreshIntervalRef.current) {
            clearInterval(tokenRefreshIntervalRef.current)
          }
          tokenRefreshIntervalRef.current = setInterval(() => {
            boundTurnstile.reset()
            boundTurnstile.execute()
          }, 5 * 60 * 1000)
        }}
        onVerify={handleVerified}
        onExpire={handleExpired}
        onError={() => {
          setIsVerifying(false)
          toast.error('Captcha failed. Please try again.')
        }}
      />
      <div className="flex w-full flex-col justify-between gap-x-2 gap-y-4 xl:flex-row xl:gap-x-4">
        {providers.map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            className="flex-center rounded-xl border-2 border-bgColor-gray300 px-8 py-2 transition-colors duration-200 hover:border-bgColor-gray500 xl:px-10 disabled:opacity-60"
            onClick={() => onSubmit(id)}
            aria-label={`Sign in with ${id}`}
            disabled={isVerifying}
          >
            {icon}
          </button>
        ))}
      </div>
    </>
  )
}

export default ProviderButtons
