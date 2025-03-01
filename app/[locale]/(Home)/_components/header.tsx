'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Mail, Copy, Globe } from 'lucide-react'
import LanguageChanger from '@/components/translator/LanguageChanger'
import React from 'react'

const Header = () => {
  const { toast } = useToast()

  const handleClick = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
    })
  }

  return (
    <div className="flex-between text-textColor-white bg-background-gray h-[60px] w-full px-8">
      <div className="flex gap-x-2">
        {/* <TooltipProvider>
          <Tooltip> */}
            {/* <TooltipTrigger asChild>
              <button
                type="button"
                className="group hidden items-center gap-x-2 rounded-md p-1 hover:text-[#EFB9A2] focus:outline-none focus:ring-2 focus:ring-[#EFB9A2] focus:ring-offset-2 sm:flex"
                onClick={() => handleClick('+1 (778) 583-7088')}
                aria-label="Copy phone number to clipboard"
              >
                <Phone className="h-5 w-5" />
                <span>{'+1 (778) 583-7088'}</span>
              </button>
            </TooltipTrigger> */}
            {/* <TooltipContent>
              <p className="flex gap-x-2 text-sm text-textColor-brand">
                Copy
                <Copy className="h-4 w-4" />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex-center gap-x-2 rounded-md p-1 hover:text-textColor-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={() => handleClick('info@vietvibe.org')}
                aria-label="Copy email address to clipboard"
              >
                <Mail className="h-5 w-5" /> <span>info@vietvibe.org</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1B171A]">
              <p className="flex gap-x-2 text-sm text-textColor-brand-light">
                Copy
                <Copy className="h-4 w-4" />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* LanguageChanger: Top-Right Corner */}
      <div className="flex-center gap-x-2 pl-7">
        <Globe className="h-5 w-5" />
        <LanguageChanger />
      </div>
    </div>
  )
}

export default Header
