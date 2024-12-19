import React from 'react'
import SignInForm from '../_components/SignInForm'
import Image from 'next/image'
function signInPage() {
  return (
    <div className="min-w-screen flex min-h-screen bg-[#1B171A]/80 px-8 lg:px-16">
      <div className="m-auto flex h-full max-h-[1700px] w-full max-w-7xl flex-col rounded-md bg-slate-100 shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[55%] md:block">
          <Image
            src="/sample-images/image4.jpg"
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
