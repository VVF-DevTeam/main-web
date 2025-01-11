'use client'
import React from 'react'
import { authAction } from '@/lib/actions/authAction'
import { authType } from '@/lib/types/authTpes'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

const ProviderButtons = () => {
  const onSubmit = async (provider: authType) => {
    try {
      await authAction(provider)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full flex-col justify-between gap-x-2 gap-y-4 xl:flex-row xl:gap-x-4">
      <button
        className="flex items-center justify-center rounded-xl border-2 border-[#620BC4]/20 px-16 py-2 hover:border-[#620BC4]/60 hover:bg-[#1B171A]/10 xl:px-20"
        onClick={() => onSubmit('github')}
      >
        <FaGithub className="h-6 w-6" />
      </button>

      <button
        className="flex items-center justify-center rounded-xl border-2 border-[#620BC4]/20 px-16 py-2 hover:border-[#620BC4]/60 hover:bg-[#1B171A]/10 xl:px-20"
        onClick={() => onSubmit('google')}
      >
        <FcGoogle className="h-6 w-6" />
      </button>
    </div>
  )
}

export default ProviderButtons
