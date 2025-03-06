import React from 'react'
import SignUpForm from '@/app/[locale]/(auth)/_components/SignUpForm'
import Image from 'next/image'
function signUpPage() {
  return (
    <div className="my-20 flex p-6 lg:p-12">
      <div className="m-auto flex h-full max-h-[1700px] w-full max-w-7xl flex-col rounded-md bg-slate-100 shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[40%] overflow-hidden md:block">
          <Image
            src="/bg/antique-building.jpg"
            alt="Org image"
            fill
            className="rounded-l-md object-cover transition-all ease-in hover:scale-[103%] hover:brightness-90"
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
