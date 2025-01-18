import React from 'react'
import SignInForm from '@/app/[locale]/(auth)/_components/SignInForm'
import Image from 'next/image'
function signInPage() {
  return (
    <div className="my-20 flex p-6 lg:p-12 w-full h-full">
      <div className="m-auto flex h-full max-h-[1700px] w-full max-w-7xl flex-col rounded-md bg-slate-100 shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[55%] md:block">
          <Image
            src="/sample-images/image7.jpg"
            alt="Org image"
            fill
            className="rounded-md object-cover"
          />
        </div>
        <SignInForm />
      </div>
    </div>
  )
}

export default signInPage
