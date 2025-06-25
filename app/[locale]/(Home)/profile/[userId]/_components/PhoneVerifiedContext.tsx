'use client'
import React, { useContext, useState } from 'react'

type PhoneVerifiedContextType = {
  phoneVerified: string | boolean
  setPhoneVerified: (value: string | boolean) => void
}

const PhoneVerifiedContext = React.createContext<
  PhoneVerifiedContextType | undefined
>(undefined)

export const usePhoneVerifiedContext = () => {
  const context = useContext(PhoneVerifiedContext)
  if (!context) {
    throw new Error(
      'usePhoneVerifiedContext must be used within a PhoneVerifiedContextProvider'
    )
  }
  return context
}

export const PhoneVerifiedContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [phoneVerified, setPhoneVerified] = useState<string | boolean>(false)

  return (
    <div>
        <PhoneVerifiedContext.Provider
            value={{ phoneVerified, setPhoneVerified }}
        >
            {children}
        </PhoneVerifiedContext.Provider>
    </div>
  )
}
