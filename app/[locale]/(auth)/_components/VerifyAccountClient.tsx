'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyToken } from '@/lib/actions/token/verifyToken'
import ClipLoader from 'react-spinners/ClipLoader'

type VerifyTokenResponse = {
  message: string
  success: boolean
}

const VerifyAccountClient = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const getVerificationToken = async () => {
    if (!token) {
      setError(
        'Invalid token. Please check the link you used to verify your account.'
      )
      return
    }

    try {
      const isTokenVerified: VerifyTokenResponse = await verifyToken(token)
      if (!isTokenVerified.success) {
        setError(
          'Token verification failed. This could happen because the token has expired, or the account is already verified.'
        )
      }
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred. Please try again later.')
    }
  }

  useEffect(() => {
    getVerificationToken()
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex-center relative min-h-screen bg-bgColor-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob animation-delay-4000 absolute left-40 top-40 h-80 w-80 rounded-full bg-bgColor-secondary900 opacity-20 mix-blend-multiply blur-xl filter"></div>
      </div>

      <div className="relative flex-col-center mx-10 my-24 max-w-lg rounded-2xl border border-bg-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
        {loading ? (
          <ClipLoader
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
            color="black"
          />
        ) : (
          <div
            className={`rounded-md px-6 py-4 text-center ${
              error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {error ? (
              <>
                <p className="text-lg font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </>
            ) : (
              <p className="text-lg font-semibold">Verification successful!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyAccountClient

