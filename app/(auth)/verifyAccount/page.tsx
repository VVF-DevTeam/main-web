'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
const VerifyAccountPage = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  return <div className="bg-blue-500 min-h-screen">{token}</div>
}

export default VerifyAccountPage
