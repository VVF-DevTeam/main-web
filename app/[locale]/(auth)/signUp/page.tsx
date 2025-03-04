import React from 'react'
import SignUpForm from '@/app/[locale]/(auth)/_components/SignUpForm'
import Image from 'next/image'
function signUpPage() {
  return (
    <div className="my-20 flex h-full w-full p-6 lg:p-12">
      <div className="width-max-default bg-bgColor-grayLight m-auto flex h-full w-full flex-col rounded-md shadow-md md:flex-row">
        <div className="relative hidden shrink-0 basis-[45%] md:block">
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
