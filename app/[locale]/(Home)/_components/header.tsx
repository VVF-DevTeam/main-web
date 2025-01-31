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
    <div className="flex h-[60px] w-full flex-row items-center justify-between bg-[#2E2E2E] px-8 text-slate-300">
      <div className="flex gap-x-2">
        <TooltipProvider>
          <Tooltip>
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
            <TooltipContent className="bg-[#1B171A]">
              <p className="flex gap-x-2 text-sm text-[#EFB9A2]">
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
                className="group flex items-center gap-x-2 rounded-md p-1 hover:text-[#EFB9A2] focus:outline-none focus:ring-2 focus:ring-[#EFB9A2] focus:ring-offset-2"
                onClick={() => handleClick('info@vietvibe.org')}
                aria-label="Copy email address to clipboard"
              >
                <Mail className="h-5 w-5" /> <span>info@vietvibe.org</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1B171A]">
              <p className="flex gap-x-2 text-sm text-[#EFB9A2]">
                Copy
                <Copy className="h-4 w-4" />
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* LanguageChanger: Top-Right Corner */}
      <div className="flex items-center gap-x-2 rounded-md pl-7">
        <Globe className="h-5 w-5 text-[#f7f0f0]" />
        <LanguageChanger />
      </div>
    </div>
  )
}

export default Header
