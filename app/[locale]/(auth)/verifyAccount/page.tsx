'use client'

// Libraries
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyToken } from '@/lib/actions/token/verifyToken'

// Components
import ClipLoader from 'react-spinners/ClipLoader'

// CSS & CSS Modules

type VerifyTokenResponse = {
  message: string
  success: boolean
}

const VerifyAccountPage = () => {
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
  }, [])

  return (
    <div className="flex-center relative min-h-screen">
      <div className="flex-col-center mx-10 my-24 max-w-lg rounded-md bg-white p-8 shadow-lg">
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
