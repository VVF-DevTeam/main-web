'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyToken } from '@/lib/actions/verifyToken'
import ClipLoader from 'react-spinners/ClipLoader'

type VerifyTokenResponse = {
  message: string
  success: boolean
}

const VerifyAccountPage = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  console.log("outside")
  const getVerificationToken = async () => {
    if (!token) {
      setError(
        'Invalid token. Please check the link you used to verify your account.'
      )
      return
    }

    setLoading(true)

    try {
      const isTokenVerified: VerifyTokenResponse = await verifyToken(token)
      if (!isTokenVerified.success) {
        setError(
          'Token verification failed. This could happen because the token has expired, or the account is already verified.'
        )
      }
      console.log(isTokenVerified)
    } catch (err) {
      console.log(err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVerificationToken()
  }, [])

  return (
    <div className="flex min-h-screen justify-center">
      <div className="min-w-56 my-24 flex max-w-md flex-col items-center justify-center rounded-md bg-[url(/bg/tennis-racket-blur.jpg)] bg-cover bg-center p-8 shadow-lg">
        {loading ? (
          <ClipLoader
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
            color="white"
          />
        ) : (
          <div
            className={`w-full rounded-md px-6 py-4 text-center ${
              error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {error ? (
              <>
                <p className="text-lg font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </>
            ) : (
              <p className="text-lg font-semibold">
                {'Verification successful!'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyAccountPage
