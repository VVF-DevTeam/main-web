'use client'

// Components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
// import { Mail, Copy, Globe } from 'lucide-react'
// import { toast } from 'sonner'
// Libraries
import LanguageChanger from '@/components/translator/LanguageChanger'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Main Component
const Header = () => {
  // const handleClick = (text: string) => {
  //   navigator.clipboard.writeText(text)
  //   toast('Copied to clipboard', {
  //     icon: <Copy className="h-4 w-4" />,
  //     className: 'text-green-500',
  //   })
  // }

  return (
    <div className="flex h-[48px] w-full items-center justify-end bg-bgColor-secondary900 sm:px-3 md:px-8">
      {/* Tooltip for email */}
      {/* <div className="flex gap-x-2">
        <TooltipProvider>
          <Tooltip>
        <TooltipTrigger asChild>
              <button
                type="button"
                className="group hidden items-center gap-x-2 rounded-md p-1 hover:text-[#EFB9A2] focus:outline-none focus:ring-2 focus:ring-[#EFB9A2] focus:ring-offset-2 sm:flex"
                onClick={() => handleClick('+1 (778) 583-7088')}
                aria-label="Copy phone number to clipboard"
              >
                <Phone className="h-5 w-5" />
                <span>{'+1 (778) 583-7088'}</span>
              </button>
            </TooltipTrigger>
        <TooltipContent>
              <p className="flex gap-x-2 text-sm text-textColor-brand900">
                Copy
                <Copy className="h-4 w-4" />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex-center gap-x-2 rounded-md p-1 text-sm hover:text-textColor-brand600 focus:outline-none focus:ring-2 focus:ring-offset-2 md:text-base"
                onClick={() => handleClick('media@vietvibe.org')}
                aria-label="Copy email address to clipboard"
                aria-live="polite"
              >
                <Mail className="h-5 w-5" /> <span>media@vietvibe.org</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-bgColor-black">
              <p className="flex gap-x-2 text-sm text-textColor-brand600">
                Copy
                <Copy className="h-4 w-4" />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div> */}

      <div className="flex-center gap-x-2">
        {/* Mobile App Links */}
        <div className="flex items-center justify-center gap-x-2">
          {/* Android App Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 hover:text-textColor-brand900 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label="Download Android app"
                >
                  <Link
                    className="flex items-end gap-x-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://play.google.com/store/apps/details?id=com.vvf_mobile"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M17.6 9.48l1.43-2.49a.5.5 0 1 0-.87-.5l-1.45 2.52A7.02 7.02 0 0 0 6.4 9.48L4.95 7a.5.5 0 1 0-.87.5l1.43 2.49A6.98 6.98 0 0 0 3 15.5V17a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-1.5a6.98 6.98 0 0 0-1.4-6.02zM7.5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm9 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    <span className="text-xs">Android</span>
                  </Link>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-bgColor-black">
                <p className="text-sm text-textColor-brand600">
                  Download Android App
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* iOS App Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-end gap-x-1 rounded-md p-1 hover:text-textColor-brand900 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label="Download iOS app"
                >
                  <Link
                    className="flex items-end gap-x-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://apps.apple.com/app/vietvibe/id6753900000"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span className="text-xs">iOS</span>
                  </Link>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-bgColor-black">
                <p className="text-sm text-textColor-brand600">
                  Download iOS App
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* LanguageChanger: Top-Right Corner */}
        <div className="flex-center pl-7">
          <Image
            src="/icons/solar-globe.png"
            alt="Globe"
            width={24}
            height={24}
            className="flex-shrink-0 invert"
            unoptimized
          />
          <LanguageChanger />
        </div>
      </div>
    </div>
  )
}

export default Header
