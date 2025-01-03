'use client'

import React from 'react'
import { Contact2 } from 'lucide-react'

const Contact = () => {
  const handleClick = () => {
    window.location.href = "https://www.instagram.com/vietvibe.foundation";
  }

  return (
    <div className="h-[50vh] w-full bg-[#1B171A]/50">
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-20 p-12">
        <div className="flex flex-col items-center justify-center gap-y-6">
          <h2 className="cursor-default text-center text-5xl font-bold tracking-wide text-[#EFB9A2] transition-all duration-100 ease-out hover:text-[#EFB9A2]/70">
            GET IN TOUCH WITH US
          </h2>
        </div>
        <button className="inline-flex items-center rounded-md border-b-2 border-[#EFB9A2] bg-[#1B171A] px-14 py-6 font-bold tracking-wide shadow-md hover:border-[#EFB9A2]/80 hover:bg-[#1B171A]/90 hover:text-white"
          onClick={handleClick}>
          <a className="mx-auto flex items-center gap-x-4 text-[#EFB9A2]">
            Chat With Us
            <Contact2 className="h-7 w-7" />
          </a>
        </button>
      </div>
    </div>
  )
}

export default Contact
