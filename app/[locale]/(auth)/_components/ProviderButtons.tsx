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
   * Promise-based waiting for Turnstile verification.
   *
   * Turnstile is "invisible" and may verify after the user clicks a provider.
   * To guarantee we only call `authAction` after `handleVerified` ran, we wait
   * for the next `onVerify(token)` via a Promise.
   */
  const tokenWaitResolveRef = useRef<((token: string) => void) | null>(null)
  const tokenWaitRejectRef = useRef<((err: unknown) => void) | null>(null)
  // If the token arrives because of a "retry after captcha failure" flow,
  // we don't want the pre-token click handler to submit again.
  const tokenResolvedViaRetryRef = useRef(false)

  useEffect(() => {
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current)
      }
      tokenWaitResolveRef.current = null
      tokenWaitRejectRef.current = null
    }
  }, [])

  const isCaptchaFailure = (message: string) =>
    message.toLowerCase().includes('captcha verification failed')

  const refreshTurnstileToken = () => {
    if (!turnstileRef.current) return
    // Clear any existing token immediately so we can't accidentally reuse it
    // while the new `execute()` is still in flight.
    turnstileTokenRef.current = ''
    turnstileRef.current.reset()
    turnstileRef.current.execute()
  }

  const waitForTurnstileToken = (ms = 10000) => {
    // If we already have a token, no need to wait.
    if (turnstileTokenRef.current) {
      return Promise.resolve(turnstileTokenRef.current)
    }

    return new Promise<string>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        reject(new Error('Turnstile token timeout'))
      }, ms)

      tokenWaitResolveRef.current = (token) => {
        window.clearTimeout(timeoutId)
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        resolve(token)
      }

      tokenWaitRejectRef.current = (err) => {
        window.clearTimeout(timeoutId)
        tokenWaitResolveRef.current = null
        tokenWaitRejectRef.current = null
        reject(err)
      }
    })
  }

  const onSubmit = async (provider: authType, hasRetried = false) => {
    try {
      setIsVerifying(true)

      // Wait for the Turnstile token to be verified before calling the server.
      if (!turnstileTokenRef.current) {
        try {
          await waitForTurnstileToken(10000)
        } catch {
          // No toast here: the UX is "show loader for 2 seconds, then stop".
          return
        }
      }

      // If token resolved via the "retry after captcha failure" flow, the retry
      // submission will already be handled by `handleVerified`.
      if (tokenResolvedViaRetryRef.current) {
        tokenResolvedViaRetryRef.current = false
        return
      }

      if (!turnstileTokenRef.current) return

      await authAction(provider, turnstileTokenRef.current)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      if (!hasRetried && isCaptchaFailure(errorMessage)) {
        pendingProviderRef.current = provider
        retryAfterCaptchaFailRef.current = true

        // refreshTurnstileToken will trigger onVerify/handleVerified again, which has a check to call onSubmit again if it is isCaptchaFailure
        refreshTurnstileToken()
        return
      }

      // Rotate token for any provider auth failure
      refreshTurnstileToken()
      toast.error(`Could not connect to ${provider}, please try again or refresh the page.`)
      console.log(error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerified = (token: string) => {
    turnstileTokenRef.current = token
    const isRetryFlow =
      retryAfterCaptchaFailRef.current && pendingProviderRef.current
    tokenResolvedViaRetryRef.current = Boolean(isRetryFlow)

    // Resolve any pending `waitForTurnstileToken()` promise.
    if (tokenWaitResolveRef.current) {
      tokenWaitResolveRef.current(token)
    }

    if (retryAfterCaptchaFailRef.current && pendingProviderRef.current) {
      const provider = pendingProviderRef.current
      retryAfterCaptchaFailRef.current = false
      pendingProviderRef.current = null
      void onSubmit(provider, true)
    }
  }

  const handleExpired = () => {
    turnstileTokenRef.current = ''
    if (tokenWaitRejectRef.current) {
      tokenWaitRejectRef.current(new Error('Turnstile expired'))
    }
  }

  return (
    <>
      {/* Covers both the 2s “wait for Turnstile” state and the in-flight OAuth redirect */}
      {isVerifying && <Loader />}
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
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
          toast.error('Could not connect to the provider, please refresh the page and try again.')
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
