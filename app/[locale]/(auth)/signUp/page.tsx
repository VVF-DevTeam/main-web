// Libraries
import React from 'react'

// Components
import SignUpForm from '@/app/[locale]/(auth)/_components/SignUpForm'
import Image from 'next/image'
import type { Metadata } from 'next'
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Sign Up | Viet Vibe Foundation',
  description: 'Sign up to create your account and reserve our latest events and lessons',
  openGraph: {
    title: 'Sign Up | Viet Vibe Foundation',
    description: 'Sign up to create your account and reserve our latest events and lessons',
    images: {
      url: '/logo/main-logo-white.jpg',
      alt: 'Sign Up | Viet Vibe Foundation',
    },
  },
}

// Main Component
async function signUpPage() {
  return (
    <div className="my-20 flex p-6 lg:p-12">
      <div className="width-max-default m-auto flex h-full w-full flex-col rounded-md bg-bgColor shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[45%] md:block">
          <Image
            src="https://drive.google.com/thumbnail?id=1qOdfbyKdQDXeRYCL8ctTMK8IlOxeDAgf"
            alt="Org image"
            fill
            className="rounded-l-md object-cover transition-all hover:brightness-90"
            priority
            sizes="(max-width: 767px) 0px, 45vw"
            />
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}

export default signUpPage
