'use client'
import React, { useRef, useState } from 'react'
import { authAction } from '@/lib/actions/auth/authAction'
import { authType } from '@/lib/types/authTpes'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'
import Turnstile, { type BoundTurnstileObject } from 'react-turnstile'
import { toast } from 'sonner'

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
  const [pendingProvider, setPendingProvider] = useState<authType | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const turnstileRef = useRef<BoundTurnstileObject | null>(null)
  const turnstileTokenRef = useRef('')

  const onSubmit = async (provider: authType) => {
    try {
      setPendingProvider(provider)
      setIsVerifying(true)
      turnstileRef.current?.execute()
    } catch (error) {
      setIsVerifying(false)
      console.log(error)
    }
  }

  const handleVerified = async (token: string) => {
    if (!pendingProvider) {
      setIsVerifying(false)
      return
    }

    turnstileTokenRef.current = token

    try {
      await authAction(pendingProvider, token)
    } catch (error) {
      toast.error('Captcha verification failed')
      setIsVerifying(false)
      setPendingProvider(null)
      console.log(error)
    }
  }

  const handleExpired = () => {
    turnstileTokenRef.current = ''
    setIsVerifying(false)
    setPendingProvider(null)
  }

  return (
    <>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        size="invisible"
        execution="execute"
        onLoad={(_, boundTurnstile) => {
          turnstileRef.current = boundTurnstile
        }}
        onVerify={handleVerified}
        onExpire={handleExpired}
        onError={() => {
          setIsVerifying(false)
          setPendingProvider(null)
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
