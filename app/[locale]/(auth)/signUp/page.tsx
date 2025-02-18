import React from 'react'
import SignUpForm from '@/app/[locale]/(auth)/_components/SignUpForm'
import Image from 'next/image'
function signUpPage() {
  return (
    <div className="my-20 flex p-6 lg:p-12 w-full h-full">
      <div className="m-auto flex h-full max-h-[1700px] w-full max-w-7xl flex-col rounded-md bg-slate-100 shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[40%] md:block">
          <Image
            src="https://drive.google.com/thumbnail?id=1qOdfbyKdQDXeRYCL8ctTMK8IlOxeDAgf&sz=w1000"
            alt="Org image"
            fill
            className="rounded-l-md object-cover"
          />
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}

export default signUpPage
