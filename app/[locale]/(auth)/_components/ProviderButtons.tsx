'use client'
import React from 'react'
import { authAction } from '@/lib/actions/auth/authAction'
import { authType } from '@/lib/types/authTpes'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import Image from 'next/image'

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
      />
    ),
  },
  { id: 'github', icon: <FaGithub className="h-6 w-6" /> },
]

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
      {providers.map(({ id, icon }) => (
        <button
          key={id}
          type="button"
          className="flex-center rounded-xl border-2 border-bgColor-brand/20 px-8 py-2 transition-colors duration-200 hover:border-bgColor-brand/60 hover:bg-bgColor-black/10 xl:px-10"
          onClick={() => onSubmit(id)}
          aria-label={`Sign in with ${id}`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

export default ProviderButtons
