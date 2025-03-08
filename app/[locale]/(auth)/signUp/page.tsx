// Libraries
import React from 'react'

// Components
import SignUpForm from '@/app/[locale]/(auth)/_components/SignUpForm'
import Image from 'next/image'

// Main Component
async function signUpPage() {
  return (
    <div className="my-20 flex p-6 lg:p-12">
      <div className="width-max-default bg-bgColor m-auto flex h-full w-full flex-col rounded-md shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[45%] md:block">
          <Image
            src="https://drive.google.com/thumbnail?id=1qOdfbyKdQDXeRYCL8ctTMK8IlOxeDAgf&sz=w1000"
            alt="Org image"
            fill
            className="rounded-l-md object-cover transition-all hover:brightness-90"
            priority
            sizes='sizes="(min-width: 1280px) 1514px, 1539px'
          />
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}

export default signUpPage
