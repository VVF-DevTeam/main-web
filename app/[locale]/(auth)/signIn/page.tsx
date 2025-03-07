// Libraries
import React from 'react'

// Components
import SignInForm from '@/app/[locale]/(auth)/_components/SignInForm'
import Image from 'next/image'

// Main Component
async function signInPage() {
  return (
    <div className="my-20 flex h-full w-full p-6 lg:p-12">
      <div className="width-max-default bg-bgColor m-auto flex h-full w-full flex-col rounded-md shadow-xl md:flex-row">
        <div className="relative hidden shrink-0 basis-[55%] overflow-hidden md:block">
          <Image
            src="https://drive.google.com/thumbnail?id=1sfkb7WxViJqu-W0XIVkajaI9LrYZ3JQq&sz=w2000"
            alt="Org image"
            fill
            className="rounded-l-md object-cover hover:brightness-90"
            priority
            sizes="(min-width: 1280px) 1514px, 1539px"
          />
        </div>
        <SignInForm />
      </div>
    </div>
  )
}

export default signInPage
